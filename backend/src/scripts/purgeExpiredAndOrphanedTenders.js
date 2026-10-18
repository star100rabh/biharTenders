import 'dotenv/config';
import { r2, getBackupR2Client } from '../utils/r2Storage.js';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { connectDB, closeDB } from '../config/db.js';
import Tender from '../models/Tender.js';
import { retentionService } from '../services/retention.service.js';

async function run() {
  console.log('\n================================================================');
  console.log('🧹 BiharTenders: Comprehensive Expired & Orphaned Storage Purge');
  console.log('📍 Targets: MongoDB Atlas & Cloudflare R2 Storage (Primary & Backup)');
  console.log('================================================================\n');

  try {
    await connectDB();

    // Step 1: Standard Expired Tenders Purge (MongoDB & R2)
    console.log('👉 Step 1: Checking for Expired Tenders in MongoDB...');
    const expiredResult = await retentionService.purgeExpiredTenders('CLI_PURGE');
    console.log(`   - Expired tenders removed from DB: ${expiredResult.purgedCount || 0}`);
    console.log(`   - Associated R2 files removed:      ${expiredResult.totalR2FilesDeleted || 0}\n`);

    // Step 2: Orphaned Files Purge from Cloudflare R2
    console.log('👉 Step 2: Scanning Cloudflare R2 for Orphaned/Expired Document Folders...');
    const activeTenders = await Tender.find({}, { sourceTenderId: 1, tenderId: 1 }).lean();
    const activeIdSet = new Set();
    for (const t of activeTenders) {
      if (t.sourceTenderId) activeIdSet.add(String(t.sourceTenderId));
      if (t.tenderId) activeIdSet.add(String(t.tenderId));
    }
    console.log(`   - Total Active Tenders in MongoDB: ${activeIdSet.size}`);

    const primaryBucket = process.env.R2_BUCKET_NAME;
    if (!primaryBucket) {
      throw new Error('R2_BUCKET_NAME is not set in environment variables!');
    }

    let isTruncated = true;
    let token = undefined;
    let orphanedObjects = [];
    let totalBytesFreed = 0;

    while (isTruncated) {
      const listRes = await r2.send(new ListObjectsV2Command({
        Bucket: primaryBucket,
        ContinuationToken: token,
        MaxKeys: 1000,
      }));

      if (listRes.Contents) {
        for (const item of listRes.Contents) {
          // Extract tenderId: tenders/{dept}/{tenderId}_{date}/... or tenders/{tenderId}/...
          const match = item.Key.match(/tenders\/(?:[^\/]+\/)?([0-9A-Za-z_]+?)(?:_\d{4}-\d{2}-\d{2})?\//);
          const tenderId = match ? match[1] : null;

          if (!tenderId || !activeIdSet.has(tenderId)) {
            orphanedObjects.push({ Key: item.Key });
            totalBytesFreed += (item.Size || 0);
          }
        }
      }
      isTruncated = listRes.IsTruncated;
      token = listRes.NextContinuationToken;
      process.stdout.write('.');
    }
    console.log('\n');

    console.log(`   - Found ${orphanedObjects.length} orphaned/expired files in Cloudflare R2`);
    console.log(`   - Storage Space to be reclaimed: ${(totalBytesFreed / 1024 / 1024).toFixed(2)} MB (${(totalBytesFreed / 1024 / 1024 / 1024).toFixed(3)} GB)`);

    // Step 3: Batch Deletion in chunks of 1000
    if (orphanedObjects.length > 0) {
      console.log('\n👉 Step 3: Purging orphaned files in batches from Cloudflare R2...');
      const BATCH_SIZE = 1000;
      let deletedCount = 0;

      for (let i = 0; i < orphanedObjects.length; i += BATCH_SIZE) {
        const batch = orphanedObjects.slice(i, i + BATCH_SIZE);
        await r2.send(new DeleteObjectsCommand({
          Bucket: primaryBucket,
          Delete: {
            Objects: batch,
            Quiet: true,
          },
        }));
        deletedCount += batch.length;
        console.log(`   ✅ Purged batch: ${deletedCount} / ${orphanedObjects.length} files removed`);
      }
    }

    console.log('\n================================================================');
    console.log('🎉 STORAGE PURGE COMPLETE!');
    console.log(`🗑️  Total Files Purged from Cloudflare R2: ${orphanedObjects.length}`);
    console.log(`💾 Total Storage Reclaimed:              ${(totalBytesFreed / 1024 / 1024).toFixed(2)} MB (${(totalBytesFreed / 1024 / 1024 / 1024).toFixed(3)} GB)`);
    console.log('================================================================\n');

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Purge failed:', err);
    await closeDB().catch(() => {});
    process.exit(1);
  }
}

run();
