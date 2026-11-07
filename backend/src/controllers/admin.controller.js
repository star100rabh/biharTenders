/**
 * @file backend/src/controllers/admin.controller.js
 * @description Controller actions servicing the isolated Admin Dashboard Panel.
 */
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { diagnosticService } from '../services/diagnostic.service.js';
import { schedulerService } from '../services/scheduler.service.js';
import { backupService } from '../services/backup.service.js';
import { retentionService } from '../services/retention.service.js';
import { reconciliationService } from '../services/reconciliation.service.js';
import { syncR2Buckets } from '../scripts/syncR2Mirror.js';
import SystemLog from '../models/SystemLog.js';
import SyncJob from '../models/SyncJob.js';
import CronConfig from '../models/CronConfig.js';
import Tender from '../models/Tender.js';
import PendingDocumentTender from '../models/PendingDocumentTender.js';

/**
 * Validate admin credentials
 */
export const verifyAdminSession = async (req, res) => {
  return res.status(200).json({
    authenticated: true,
    user: req.adminUser,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Real-time network latency, memory, and services telemetry
 */
export const getTelemetry = async (req, res) => {
  try {
    const telemetry = await diagnosticService.getSystemTelemetry();
    return res.status(200).json(telemetry);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve telemetry', message: err.message });
  }
};

/**
 * Database overview, tender counts, missing PDFs, and sync status
 */
export const getOverview = async (req, res) => {
  try {
    const overview = await diagnosticService.getDatabaseOverview();
    return res.status(200).json(overview);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve overview', message: err.message });
  }
};

/**
 * Intelligent error diagnostics with root-cause analysis and remediation steps
 */
export const getDiagnostics = async (req, res) => {
  try {
    const diagnostics = await diagnosticService.getDiagnosticsAndActiveIssues();
    return res.status(200).json({ issues: diagnostics, count: diagnostics.length });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate diagnostics', message: err.message });
  }
};

/**
 * Query persistent system logs with pagination & filtering
 */
export const getLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
    const { level, source, search } = req.query;

    const query = {};
    if (level && level !== 'ALL') query.level = level;
    if (source && source !== 'ALL') query.source = source;
    if (search) {
      query.message = { $regex: search, $options: 'i' };
    }

    const [logs, total] = await Promise.all([
      SystemLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      SystemLog.countDocuments(query),
    ]);

    return res.status(200).json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch logs', message: err.message });
  }
};

/**
 * Clear or mark logs as resolved
 */
export const resolveLog = async (req, res) => {
  try {
    const { id } = req.params;
    await SystemLog.findByIdAndUpdate(id, { resolved: true });
    return res.status(200).json({ success: true, message: 'Log marked as resolved' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resolve log', message: err.message });
  }
};

/**
 * Ingestion Run History
 */
export const getSyncHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));

    const [jobs, total] = await Promise.all([
      SyncJob.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      SyncJob.countDocuments(),
    ]);

    return res.status(200).json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch sync history', message: err.message });
  }
};

let activeCrawlerProcess = null;

/**
 * Attaches real-time stdout/stderr log stream listener to a crawler child process
 * Streams rich logs to SystemLog (for live terminal in admin panel) and updates SyncJob progress metrics.
 */
function attachCrawlerLogStream(child, syncJobId, startTime = Date.now()) {
  let stdoutBuffer = '';
  let stderrBuffer = '';

  const cleanAnsi = (str) =>
    str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim();

  const handleLine = async (rawLine, isStderr = false) => {
    let line = cleanAnsi(rawLine);
    if (!line) return;

    // Check if Pino JSON log (e.g. {"level":30,"time":...,"msg":"[PDF Compressor] ..."})
    if (line.startsWith('{') && line.endsWith('}')) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.msg) line = parsed.msg;
      } catch (e) {}
    }

    // Ignore noisy low-level Chromium sandbox / GPU logs that add zero value
    if (
      line.includes('gpu_init.cc') ||
      line.includes('gl_surface') ||
      line.includes('font_service') ||
      line.includes('ozone_platform') ||
      line.includes('vaapi_wrapper') ||
      line.includes('dbus') ||
      line.includes('DevTools listening on') ||
      line.includes('Created TensorFlow Lite XNNPACK delegate')
    ) {
      return;
    }

    // Determine log level
    let level = isStderr ? 'WARN' : 'INFO';
    if (
      line.includes('❌') ||
      line.includes('Error:') ||
      line.toLowerCase().includes('scraping failed') ||
      line.toLowerCase().includes('failed to dynamic-install')
    ) {
      level = 'ERROR';
    } else if (line.includes('⚠️') || line.includes('WARN')) {
      level = 'WARN';
    }

    // Update real-time sync job counters if syncJobId exists
    if (syncJobId) {
      // 1. Saved tender to database
      const savedMatch = line.match(/Saved Tender to MongoDB:\s*([^\s]+)\s*\((\d+)\s*files attached\)/i);
      if (savedMatch) {
        const fileCount = parseInt(savedMatch[2], 10) || 0;
        await SyncJob.findByIdAndUpdate(syncJobId, {
          $inc: { itemsProcessed: 1, newTendersFound: 1, pdfsDownloaded: fileCount }
        }).catch(() => {});
      }

      // 2. Fast-forward skipped tenders
      const skipMatch = line.match(/Fast-forward:\s*Skipped\s+(\d+)\s+already fetched/i);
      if (skipMatch) {
        const skippedCount = parseInt(skipMatch[1], 10) || 0;
        await SyncJob.findByIdAndUpdate(syncJobId, {
          $inc: { itemsProcessed: skippedCount }
        }).catch(() => {});
      }

      // 3. Finished scraping summary
      if (line.includes('Finished scraping:')) {
        try {
          const jsonPart = line.substring(line.indexOf('{'));
          const summary = JSON.parse(jsonPart.replace(/'/g, '"'));
          if (summary) {
            await SyncJob.findByIdAndUpdate(syncJobId, {
              $set: {
                newTendersFound: summary.totalIngested || 0,
                pdfsDownloaded: summary.totalPdfsSecured || 0,
                missingPdfCount: summary.totalWithoutDocuments || 0,
              }
            }).catch(() => {});
          }
        } catch (e) {}
      }
    }

    // Save to SystemLog for live stream in admin panel
    await SystemLog.create({
      level,
      source: 'WORKER_SCRAPER',
      message: line.substring(0, 500)
    }).catch(() => {});
  };

  child.stdout.on('data', async (chunk) => {
    stdoutBuffer += chunk.toString();
    const lines = stdoutBuffer.split('\n');
    stdoutBuffer = lines.pop() || '';
    for (const l of lines) {
      await handleLine(l, false);
    }
  });

  child.stderr.on('data', async (chunk) => {
    stderrBuffer += chunk.toString();
    const lines = stderrBuffer.split('\n');
    stderrBuffer = lines.pop() || '';
    for (const l of lines) {
      await handleLine(l, true);
    }
  });

  child.on('close', async (code) => {
    activeCrawlerProcess = null;
    if (stdoutBuffer.trim()) {
      await handleLine(stdoutBuffer.trim(), false);
    }
    if (stderrBuffer.trim()) {
      await handleLine(stderrBuffer.trim(), true);
    }

    if (syncJobId) {
      const durationMs = Date.now() - startTime;
      const finalStatus = code === 0 ? 'completed' : 'failed';
      await SyncJob.findByIdAndUpdate(syncJobId, {
        status: finalStatus,
        durationMs,
        ...(code !== 0 ? { errorMessage: `Crawler process exited with code ${code}` } : {})
      }).catch(() => {});
    }
  });
}

/**
 * Trigger immediate manual ingestion (supports mode: 'ALL' | 'LATEST', limit, reset)
 */
export const triggerManualSync = async (req, res) => {
  try {
    const { mode = 'LATEST', limit = 100, reset = false, targetCategory = 'ACTIVE' } = req.body || {};

    // Check if a sync job is already actively running
    const existingRunning = await SyncJob.findOne({ status: 'running' }).lean();
    if (existingRunning || activeCrawlerProcess) {
      return res.status(400).json({
        error: 'A scraper job is already running in the background.',
        jobId: existingRunning?._id,
      });
    }

    const scriptPath = mode === 'ALL'
      ? path.join(process.cwd(), 'src/scripts/fetchBiharAll.js')
      : path.join(process.cwd(), 'src/scripts/fetchBiharLatest.js');

    const args = [scriptPath, String(limit), targetCategory];
    if (reset) args.push('--reset');

    const syncJob = await SyncJob.create({
      sourcePortal: 'BIHAR_TENDERS',
      triggeredBy: 'ADMIN_MANUAL',
      status: 'running'
    });

    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: { 
        ...process.env, 
        PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '0',
        SCRAPER_HEADLESS: process.env.SCRAPER_HEADLESS || 'true' 
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    activeCrawlerProcess = child;
    const startTime = Date.now();

    attachCrawlerLogStream(child, syncJob._id, startTime);

    return res.status(200).json({
      success: true,
      message: `${mode === 'ALL' ? 'Full Active Tenders' : 'Daily Latest Tenders'} crawl started in background.`,
      mode,
      limit,
      jobId: syncJob._id,
      pid: child.pid
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to dispatch manual sync', message: err.message });
  }
};

/**
 * Stop actively running crawler process
 */
export const stopActiveSync = async (req, res) => {
  try {
    if (activeCrawlerProcess) {
      activeCrawlerProcess.kill('SIGINT');
      activeCrawlerProcess = null;
    }
    await SyncJob.updateMany({ status: 'running' }, { status: 'failed', errorMessage: 'Stopped manually by Admin' });
    await SystemLog.create({
      level: 'WARN',
      source: 'WORKER_SCRAPER',
      message: 'Crawl process stopped manually by Admin.'
    }).catch(() => {});

    return res.status(200).json({ success: true, message: 'Active crawl stopped.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to stop sync', message: err.message });
  }
};

/**
 * Get real-time sync progress, active job status, checkpoint, and live logs
 */
export const getLiveSyncStatus = async (req, res) => {
  try {
    const runningJob = await SyncJob.findOne({ status: 'running' }).sort({ createdAt: -1 }).lean();

    let checkpoint = null;
    const checkpointPath = path.join(process.cwd(), '.crawl_checkpoint.json');
    if (fs.existsSync(checkpointPath)) {
      try {
        checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
      } catch (e) {}
    }

    const logs = await SystemLog.find({
      source: 'WORKER_SCRAPER'
    })
    .sort({ createdAt: -1 })
    .limit(150)
    .lean();

    const isRunning = !!runningJob || !!activeCrawlerProcess;

    return res.status(200).json({
      isRunning,
      activeJob: runningJob || (activeCrawlerProcess ? { status: 'running' } : null),
      checkpoint,
      logs: logs.reverse()
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get live sync status', message: err.message });
  }
};

/**
 * Reset crawler checkpoint file
 */
export const resetCrawlCheckpoint = async (req, res) => {
  try {
    const checkpointPath = path.join(process.cwd(), '.crawl_checkpoint.json');
    if (fs.existsSync(checkpointPath)) {
      fs.unlinkSync(checkpointPath);
    }
    await SystemLog.create({
      level: 'INFO',
      source: 'WORKER_SCRAPER',
      message: 'Admin manually reset crawl checkpoint.'
    }).catch(() => {});

    return res.status(200).json({ success: true, message: 'Checkpoint reset successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset checkpoint', message: err.message });
  }
};

/**
 * Trigger dedicated missing PDF recovery pass
 */
export const triggerMissingPdfRecovery = async (req, res) => {
  try {
    const job = await schedulerService.triggerMissingPdfSync('Admin');
    return res.status(200).json({
      success: true,
      message: 'Missing PDF recovery pass dispatched.',
      jobId: job.id,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to trigger PDF recovery', message: err.message });
  }
};

/**
 * Toggle automated cron scheduling permission
 */
export const updateScheduleConfig = async (req, res) => {
  try {
    const { isAutomatedSyncEnabled } = req.body;

    const config = await CronConfig.findOneAndUpdate(
      { configKey: 'GLOBAL_CRON_SETTINGS' },
      { $set: { isAutomatedSyncEnabled: Boolean(isAutomatedSyncEnabled) } },
      { new: true, upsert: true }
    );

    await SystemLog.create({
      level: 'INFO',
      source: 'CRON',
      message: `Admin updated automated ingestion setting: isAutomatedSyncEnabled = ${config.isAutomatedSyncEnabled}`,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      config,
      message: `Automated data scraping ${config.isAutomatedSyncEnabled ? 'ENABLED' : 'PAUSED'}.`,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update schedule config', message: err.message });
  }
};

/**
 * Manually trigger 30-Day Archive Purge
 */
export const purgeExpiredArchive = async (req, res) => {
  try {
    const result = await schedulerService.purgeExpiredArchivedTenders('ADMIN_MANUAL');
    return res.status(200).json({
      success: true,
      message: `Successfully purged ${result.deletedCount} expired archived tenders.`,
      deletedCount: result.deletedCount,
      cutoffDate: result.cutoffDate,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Archive purge failed', message: err.message });
  }
};

/**
 * Manually trigger immediate Expired Tenders Purge across MongoDB, Primary R2 & Backup Server
 */
export const purgeExpiredTendersNow = async (req, res) => {
  try {
    const adminUser = req.adminUser?.email || 'ADMIN_MANUAL';
    const result = await retentionService.purgeExpiredTenders(adminUser);
    return res.status(200).json({
      success: true,
      message: `Purge completed: removed ${result.purgedCount} tender(s) from MongoDB, ${result.primaryFilesDeleted} file(s) from Primary R2, and ${result.backupFilesDeleted} file(s) from Backup Server.`,
      result,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Expired tenders purge failed', message: err.message });
  }
};

/**
 * Manually trigger on-demand Portal Parity Reconciliation
 */
export const triggerPortalReconciliation = async (req, res) => {
  try {
    const adminUser = req.adminUser?.email || 'ADMIN_MANUAL';
    const result = await reconciliationService.reconcileActiveTenders(adminUser);
    if (result.error) {
      return res.status(500).json({ error: 'Reconciliation failed', message: result.error });
    }
    return res.status(200).json({
      success: true,
      message: `Reconciliation complete. Portal active tenders: ${result.portalTotal}, Marked delisted: ${result.delistedCount}. Parity achieved.`,
      result
    });
  } catch (err) {
    return res.status(500).json({ error: 'Portal reconciliation failed', message: err.message });
  }
};

/**
 * Telemetry and list of backups for the Admin Panel
 */
export const getBackupStatus = async (req, res) => {
  try {
    const status = backupService.getBackupStatus();
    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve backup telemetry', message: err.message });
  }
};

/**
 * On-demand backup trigger from the Admin Panel
 * Body: { type: 'database' | 'full' }
 */
export const triggerBackup = async (req, res) => {
  try {
    const type = req.body.type || 'database';
    let result;

    if (type === 'full') {
      result = await backupService.createFullBackup();
    } else {
      result = await backupService.createDatabaseBackup();
    }

    return res.status(200).json({
      success: true,
      message: `Backup (${type}) completed successfully.`,
      result,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Backup execution failed',
      message: err.message,
    });
  }
};

/**
 * Securely stream and download a backup archive from disk
 */
export const downloadBackupArchive = async (req, res) => {
  try {
    const fileName = path.basename(req.params.fileName);
    const filePath = path.join(backupService.localBackupDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Backup file not found on server disk.' });
    }

    const contentType = fileName.endsWith('.zip') ? 'application/zip' : 'application/gzip';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to stream backup archive', message: err.message });
  }
};

/**
 * Download the Disaster Recovery & Backup Instruction PDF manual
 */
export const downloadDisasterRecoveryGuide = async (req, res) => {
  try {
    const candidates = [
      path.resolve(process.cwd(), '../docs/BiharTenders_Disaster_Recovery_and_Backup_Manual.pdf'),
      path.resolve(process.cwd(), 'docs/BiharTenders_Disaster_Recovery_and_Backup_Manual.pdf'),
      path.resolve(process.cwd(), 'backups/BiharTenders_Disaster_Recovery_and_Backup_Manual.pdf'),
    ];

    const targetPath = candidates.find(p => fs.existsSync(p));

    if (!targetPath) {
      return res.status(404).json({ error: 'Disaster recovery guide PDF has not been generated yet.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="BiharTenders_Disaster_Recovery_and_Backup_Manual.pdf"');

    const stream = fs.createReadStream(targetPath);
    stream.pipe(res);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to stream guide PDF', message: err.message });
  }
};

/**
 * Download the Production Deployment & Operations PDF manual
 */
export const downloadDeploymentGuide = async (req, res) => {
  try {
    const candidates = [
      path.resolve(process.cwd(), '../docs/BiharTenders_Production_Deployment_Manual.pdf'),
      path.resolve(process.cwd(), 'docs/BiharTenders_Production_Deployment_Manual.pdf'),
      path.resolve(process.cwd(), 'backups/BiharTenders_Production_Deployment_Manual.pdf'),
    ];

    const targetPath = candidates.find(p => fs.existsSync(p));

    if (!targetPath) {
      return res.status(404).json({ error: 'Deployment manual PDF has not been generated yet.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="BiharTenders_Production_Deployment_Manual.pdf"');

    const stream = fs.createReadStream(targetPath);
    stream.pipe(res);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to stream deployment manual', message: err.message });
  }
};

/**
 * Download the Future Configurations & Render Upgrade Manual PDF
 */
export const downloadFutureConfigGuide = async (req, res) => {
  try {
    const candidates = [
      path.resolve(process.cwd(), '../docs/BiharTenders_Future_Configurations_Render_and_Failover.pdf'),
      path.resolve(process.cwd(), 'docs/BiharTenders_Future_Configurations_Render_and_Failover.pdf'),
      path.resolve(process.cwd(), 'backups/BiharTenders_Future_Configurations_Render_and_Failover.pdf'),
    ];

    const targetPath = candidates.find(p => fs.existsSync(p));

    if (!targetPath) {
      return res.status(404).json({ error: 'Future configurations guide PDF has not been generated yet.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="BiharTenders_Future_Configurations_Render_and_Failover.pdf"');

    const stream = fs.createReadStream(targetPath);
    stream.pipe(res);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to stream future configuration manual', message: err.message });
  }
};


/**
 * Trigger Cloudflare R2 Document Mirror Synchronization
 */
export const triggerMirrorSync = async (req, res) => {
  try {
    const result = await syncR2Buckets();
    return res.status(200).json({
      success: true,
      message: `Mirror synchronization complete. Replicated ${result.syncedCount} missing document(s) (${result.totalMb} MB). ${result.skippedCount} already in sync.`,
      result,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Mirror synchronization failed', message: err.message });
  }
};

/**
 * Get overview metrics for pending document tenders
 */
export const getPendingDocsOverview = async (req, res) => {
  try {
    const now = new Date();
    const totalPending = await PendingDocumentTender.countDocuments({ status: { $ne: 'DOWNLOADED' } });
    const readyToDownload = await PendingDocumentTender.countDocuments({
      status: { $in: ['AWAITING_DOWNLOAD_DATE', 'READY_TO_DOWNLOAD'] },
      $or: [
        { documentDownloadStartDate: { $lte: now } },
        { documentDownloadStartDate: null },
        { status: 'READY_TO_DOWNLOAD' }
      ]
    });
    const downloaded = await PendingDocumentTender.countDocuments({ status: 'DOWNLOADED' });
    const upcoming = await PendingDocumentTender.find({
      status: 'AWAITING_DOWNLOAD_DATE',
      documentDownloadStartDate: { $gt: now }
    })
    .sort({ documentDownloadStartDate: 1 })
    .limit(10)
    .lean();

    return res.status(200).json({
      success: true,
      totalPending,
      readyToDownload,
      downloaded,
      upcoming
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get pending docs overview', message: err.message });
  }
};

/**
 * Trigger background worker to fetch documents for pending document tenders
 */
export const triggerPendingDocsFetch = async (req, res) => {
  try {
    const { limit = 50, all = false } = req.body || {};

    if (activeCrawlerProcess) {
      return res.status(400).json({
        error: 'Another crawl or sync process is already actively running.'
      });
    }

    const scriptPath = path.join(process.cwd(), 'src/scripts/fetchPendingDocTenders.js');
    const args = [scriptPath, '--limit', String(limit)];
    if (all) args.push('--all');

    const syncJob = await SyncJob.create({
      sourcePortal: 'BIHAR_TENDERS',
      triggeredBy: 'ADMIN_MANUAL',
      status: 'running'
    });

    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: { 
        ...process.env, 
        PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '0',
        SCRAPER_HEADLESS: process.env.SCRAPER_HEADLESS || 'true' 
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    activeCrawlerProcess = child;
    const startTime = Date.now();

    attachCrawlerLogStream(child, syncJob._id, startTime);

    return res.status(200).json({
      success: true,
      message: 'Pending documents recovery crawl started in background.',
      jobId: syncJob._id,
      pid: child.pid
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to dispatch pending docs recovery', message: err.message });
  }
};


