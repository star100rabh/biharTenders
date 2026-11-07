/**
 * @file backend/src/services/retention.service.js
 * @description Automatic Purging Service for Expired Tenders.
 * Purges expired tenders from both MongoDB Atlas, Primary Cloudflare R2,
 * and Secondary Backup Cloudflare R2 simultaneously with zero retention delay (no 14-day stay).
 */
import Tender from '../models/Tender.js';
import SystemLog from '../models/SystemLog.js';
import { 
  r2,
  deleteTenderFolderFromR2, 
  deleteFolderFromBackupR2, 
  getBackupR2Client 
} from '../utils/r2Storage.js';
import { connectDB } from '../config/db.js';
import { ListObjectsV2Command, GetObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino();

export class RetentionService {
  /**
   * Promotes UPCOMING tenders to ACTIVE if their bid submission start date has arrived.
   */
  async promoteUpcomingToActive() {
    const now = new Date();
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const result = await Tender.updateMany(
      {
        status: 'UPCOMING',
        bidSubmissionStartDate: { $lte: now },
        closingDate: { $gte: now }
      },
      { $set: { status: 'ACTIVE' } }
    );

    if (result.modifiedCount > 0) {
      logger.info(`[RetentionService] 🚀 Promoted ${result.modifiedCount} tender(s) from UPCOMING to ACTIVE (Bidding has officially started).`);
    }
    return result.modifiedCount;
  }

  /**
   * Evaluates all tenders against current Indian Standard Time.
   * Marks status as 'EXPIRED' once closing date/time (or bidSubmissionEndDate) has passed.
   */
  async markExpiredTenders() {
    const now = new Date();
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const result = await Tender.updateMany(
      {
        closingDate: { $lt: now },
        status: { $ne: 'EXPIRED' },
      },
      { $set: { status: 'EXPIRED' } }
    );

    if (result.modifiedCount > 0) {
      logger.info(`[RetentionService] 🏷️ Marked ${result.modifiedCount} tender(s) as EXPIRED (Current time > closing date).`);
    }
    return result.modifiedCount;
  }

  /**
   * Purges expired tenders older than retentionDays (default 20 days)
   * from MongoDB, Primary Cloudflare R2, and Secondary Backup Cloudflare R2.
   * Tenders remain accessible for 20 days after expiration for contractor intelligence.
   */
  async purgeExpiredTenders(triggeredBy = 'MANUAL', retentionDays = 20) {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
    logger.info(`[RetentionService] 🧹 Starting purge of tenders expired prior to ${cutoffDate.toISOString()} (${retentionDays}-day retention policy)...`);

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Mark any newly expired tenders first
    await this.markExpiredTenders().catch(() => {});

    // Only select tenders that expired MORE than retentionDays (20 days) ago
    const filter = {
      $or: [
        { status: 'EXPIRED', closingDate: { $lt: cutoffDate } },
        { closingDate: { $lt: cutoffDate } },
        { bidSubmissionEndDate: { $lt: cutoffDate } }
      ]
    };

    const expiredTenders = await Tender.find(filter, {
      _id: 1,
      sourceTenderId: 1,
      publishedDate: 1,
      closingDate: 1,
      r2StorageKey: 1,
      departmentCode: 1,
      organisationChain: 1,
      title: 1,
    });

    const totalFound = expiredTenders.length;
    logger.info(`[RetentionService] Identified ${totalFound} tender(s) expired > ${retentionDays} days to purge.`);

    let purgedMongoCount = 0;
    let totalPrimaryFilesDeleted = 0;
    let totalBackupFilesDeleted = 0;
    const errors = [];

    for (const tender of expiredTenders) {
      try {
        // 1. Delete associated folder from Cloudflare R2 (Primary AND Backup Server)
        const storageKey = tender.r2StorageKey || tender.sourceTenderId;
        const dept = tender.departmentCode || tender.organisationChain;
        const r2Result = await deleteTenderFolderFromR2(storageKey, tender.publishedDate, dept);

        totalPrimaryFilesDeleted += (r2Result?.deletedCount || 0);
        totalBackupFilesDeleted += (r2Result?.backupDeletedCount || 0);

        // 2. Delete document from MongoDB
        await Tender.deleteOne({ _id: tender._id });
        purgedMongoCount++;

        logger.info(`[RetentionService] Purged expired tender ${tender.sourceTenderId} (Files removed -> Primary R2: ${r2Result?.deletedCount || 0}, Backup R2: ${r2Result?.backupDeletedCount || 0})`);
      } catch (err) {
        logger.error(`[RetentionService] Error purging tender ${tender.sourceTenderId}: ${err.message}`);
        errors.push({ tenderId: tender.sourceTenderId, error: err.message });
      }
    }

    // 3. Primary R2 Sweep: Purge any orphaned or expired tender files no longer in active MongoDB
    let primaryOrphanedResult = { sweptFilesCount: 0, reclaimedBytes: 0 };
    try {
      primaryOrphanedResult = await this.purgeOrphanedFromPrimaryR2();
      totalPrimaryFilesDeleted += primaryOrphanedResult.sweptFilesCount;
      if (primaryOrphanedResult.sweptFilesCount > 0) {
        logger.info(`[RetentionService] Primary R2 sweep purged ${primaryOrphanedResult.sweptFilesCount} orphaned files (${(primaryOrphanedResult.reclaimedBytes/1024/1024).toFixed(2)} MB reclaimed).`);
      }
    } catch (primarySweepErr) {
      logger.warn(`[RetentionService] Primary R2 sweep warning: ${primarySweepErr.message}`);
    }

    // 4. Backup Server Sweep: Clean any orphaned or expired tender data directly on the backup server
    let backupSweepResult = { sweptFoldersCount: 0, sweptFilesCount: 0 };
    try {
      backupSweepResult = await this.purgeExpiredFromBackupServer(now);
      totalBackupFilesDeleted += backupSweepResult.sweptFilesCount;
      if (backupSweepResult.sweptFoldersCount > 0) {
        logger.info(`[RetentionService] Backup server sweep purged ${backupSweepResult.sweptFoldersCount} expired folder(s) (${backupSweepResult.sweptFilesCount} files).`);
      }
    } catch (sweepErr) {
      logger.warn(`[RetentionService] Backup server sweep warning: ${sweepErr.message}`);
    }

    const totalR2FilesDeleted = totalPrimaryFilesDeleted + totalBackupFilesDeleted;

    // 4. Log audit entry to SystemLog
    await SystemLog.create({
      level: 'INFO',
      source: 'DATABASE',
      message: `Expired Tenders Purge: Removed ${purgedMongoCount} tender(s) from MongoDB, ${totalPrimaryFilesDeleted} file(s) from Primary R2, and ${totalBackupFilesDeleted} file(s) from Secondary Backup R2. Triggered by ${triggeredBy}. (Zero retention delay).`,
      metadata: {
        purgedMongoCount,
        totalPrimaryFilesDeleted,
        totalBackupFilesDeleted,
        backupSweptFolders: backupSweepResult.sweptFoldersCount,
        triggeredBy,
      },
    }).catch(() => {});

    logger.info(`✅ [RetentionService] Purge complete! Removed ${purgedMongoCount}/${totalFound} tenders from MongoDB, ${totalPrimaryFilesDeleted} files from Primary R2, and ${totalBackupFilesDeleted} files from Secondary Backup R2.`);

    return {
      success: true,
      totalFound,
      purgedCount: purgedMongoCount,
      primaryFilesDeleted: totalPrimaryFilesDeleted,
      backupFilesDeleted: totalBackupFilesDeleted,
      totalR2FilesDeleted,
      backupSweptFolders: backupSweepResult.sweptFoldersCount,
      errors,
    };
  }

  /**
   * Sweeps the secondary backup Cloudflare R2 bucket for any tender folders
   * where tender data has expired (closingDate < now or marked EXPIRED / removed from MongoDB).
   * Ensures that expired JSON and documents never linger in backup storage for 14 days.
   */
  async purgeExpiredFromBackupServer(cutoffDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)) {
    const backupClient = getBackupR2Client();
    const backupBucket = process.env.BACKUP_R2_BUCKET_NAME;

    if (!backupClient || !backupBucket) {
      return { sweptFoldersCount: 0, sweptFilesCount: 0 };
    }

    logger.info('[RetentionService] 🔍 Scanning Secondary Backup R2 for expired tender folders...');
    let sweptFoldersCount = 0;
    let sweptFilesCount = 0;

    try {
      // Step 1: List all tender.json files in the backup bucket
      let isTruncated = true;
      let continuationToken = undefined;
      const tenderJsonKeys = [];

      while (isTruncated) {
        const listRes = await backupClient.send(new ListObjectsV2Command({
          Bucket: backupBucket,
          Prefix: 'tenders/',
          ContinuationToken: continuationToken,
        }));

        if (listRes.Contents) {
          for (const item of listRes.Contents) {
            if (item.Key.endsWith('/tender.json') || item.Key.endsWith('tender.json')) {
              tenderJsonKeys.push(item.Key);
            }
          }
        }

        isTruncated = listRes.IsTruncated || false;
        continuationToken = listRes.NextContinuationToken;
      }

      logger.info(`[RetentionService] Found ${tenderJsonKeys.length} tender metadata file(s) in backup server to audit.`);

      // Step 2: For each tender.json, inspect its closingDate
      for (const jsonKey of tenderJsonKeys) {
        try {
          const folderPrefix = jsonKey.substring(0, jsonKey.lastIndexOf('/') + 1);

          const getRes = await backupClient.send(new GetObjectCommand({
            Bucket: backupBucket,
            Key: jsonKey,
          }));
          const bytes = await getRes.Body.transformToByteArray();
          const jsonText = Buffer.from(bytes).toString('utf-8');
          const tenderData = JSON.parse(jsonText);

          const rawClosing = tenderData.closingDate || tenderData.ClosingDate || tenderData.tenderClosingDate;
          let isExpired = false;

          if (rawClosing) {
            const closingTime = new Date(rawClosing).getTime();
            if (!isNaN(closingTime) && closingTime < cutoffDate.getTime()) {
              isExpired = true;
            }
          }

          // If closingDate in tender.json is expired, or if status is EXPIRED
          if (isExpired || tenderData.status === 'EXPIRED') {
            logger.info(`[RetentionService] Expired tender detected in backup server: ${folderPrefix} (Closing: ${rawClosing}). Purging...`);
            const delRes = await deleteFolderFromBackupR2(folderPrefix);
            sweptFoldersCount++;
            sweptFilesCount += delRes.deletedCount;
          }
        } catch (readErr) {
          logger.warn(`[RetentionService] Could not audit ${jsonKey} on backup server: ${readErr.message}`);
        }
      }

      return { sweptFoldersCount, sweptFilesCount };
    } catch (err) {
      logger.error(`[RetentionService] Backup server sweep error: ${err.message}`);
      return { sweptFoldersCount, sweptFilesCount, error: err.message };
    }
  }

  /**
   * Sweeps Primary Cloudflare R2 bucket for orphaned files/folders belonging
   * to tenders that no longer exist in MongoDB or have been expired.
   */
  async purgeOrphanedFromPrimaryR2() {
    const primaryBucket = process.env.R2_BUCKET_NAME;
    if (!primaryBucket) return { sweptFilesCount: 0, reclaimedBytes: 0 };

    try {
      const activeTenders = await Tender.find({}, { sourceTenderId: 1, tenderId: 1 }).lean();
      const activeIds = new Set();
      for (const t of activeTenders) {
        if (t.sourceTenderId) activeIds.add(String(t.sourceTenderId));
        if (t.tenderId) activeIds.add(String(t.tenderId));
      }

      let isTruncated = true;
      let token = undefined;
      const orphanedKeys = [];
      let reclaimedBytes = 0;

      while (isTruncated) {
        const res = await r2.send(new ListObjectsV2Command({
          Bucket: primaryBucket,
          ContinuationToken: token,
          MaxKeys: 1000,
        }));

        if (res.Contents) {
          for (const item of res.Contents) {
            const match = item.Key.match(/tenders\/(?:[^\/]+\/)?([0-9A-Za-z_]+?)(?:_\d{4}-\d{2}-\d{2})?\//);
            const tenderId = match ? match[1] : null;

            if (!tenderId || !activeIds.has(tenderId)) {
              orphanedKeys.push({ Key: item.Key });
              reclaimedBytes += (item.Size || 0);
            }
          }
        }

        isTruncated = res.IsTruncated;
        token = res.NextContinuationToken;
      }

      let sweptFilesCount = 0;
      const BATCH_SIZE = 1000;
      for (let i = 0; i < orphanedKeys.length; i += BATCH_SIZE) {
        const batch = orphanedKeys.slice(i, i + BATCH_SIZE);
        await r2.send(new DeleteObjectsCommand({
          Bucket: primaryBucket,
          Delete: { Objects: batch, Quiet: true }
        }));
        sweptFilesCount += batch.length;
      }

      logger.info(`[RetentionService] Primary R2 sweep purged ${sweptFilesCount} orphaned file(s) (${(reclaimedBytes/1024/1024).toFixed(2)} MB reclaimed).`);
      return { sweptFilesCount, reclaimedBytes };
    } catch (err) {
      logger.error(`[RetentionService] Primary R2 sweep error: ${err.message}`);
      return { sweptFilesCount: 0, reclaimedBytes: 0, error: err.message };
    }
  }
}

export const retentionService = new RetentionService();
