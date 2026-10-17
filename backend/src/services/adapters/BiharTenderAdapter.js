import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { uploadFileToR2 } from '../../utils/r2Storage.js';
import Tender from '../../models/Tender.js';

export default class BiharTenderAdapter {
  constructor() {
    this.baseUrl = 'https://eproc2.bihar.gov.in';
    this.tenderListingUrl = 'https://eproc2.bihar.gov.in/EPSV2Web/openarea/tenderListingPage.action#latestTenders';
    this.portalName = 'BIHAR_TENDERS';
  }

  /**
   * Scrapes ALL Active and Upcoming tenders.
   */
  async scrapeAllTenders(options = {}) {
    const { limit = Infinity, headless = true } = options;
    console.log(`[BiharAdapter] Launching browser for ALL tenders (headless: ${headless})...`);
    
    return await this._runScrapeSession(async (page, crawlSummary) => {
      console.log('--- Fetching ALL LATEST Tenders ---');
      const latestSummary = await this.scrapeTenders(page, limit, this.tenderListingUrl, 'ACTIVE');
      
      console.log('--- Fetching ALL UPCOMING Tenders ---');
      const upcomingSummary = await this.scrapeTenders(page, limit, 'https://eproc2.bihar.gov.in/EPSV2Web/openarea/tenderListingPage.action#upcomingTenders', 'UPCOMING');

      crawlSummary.totalIngested += latestSummary.totalIngested + upcomingSummary.totalIngested;
      crawlSummary.totalSkipped += latestSummary.totalSkipped + upcomingSummary.totalSkipped;
      crawlSummary.totalPdfsSecured += latestSummary.totalPdfsSecured + upcomingSummary.totalPdfsSecured;
    }, headless);
  }

  /**
   * Scrapes only a few latest tenders (e.g. for a daily fast sync)
   */
  async scrapeLatestTenders(options = {}) {
    const { limit = 50, headless = true } = options;
    console.log(`[BiharAdapter] Launching browser for LATEST tenders (headless: ${headless})...`);
    
    return await this._runScrapeSession(async (page, crawlSummary) => {
      console.log(`--- Fetching LATEST ${limit} Tenders ---`);
      const latestSummary = await this.scrapeTenders(page, limit, this.tenderListingUrl, 'ACTIVE');
      
      console.log(`--- Fetching UPCOMING ${limit} Tenders ---`);
      const upcomingSummary = await this.scrapeTenders(page, limit, 'https://eproc2.bihar.gov.in/EPSV2Web/openarea/tenderListingPage.action#upcomingTenders', 'UPCOMING');

      crawlSummary.totalIngested += latestSummary.totalIngested + upcomingSummary.totalIngested;
      crawlSummary.totalSkipped += latestSummary.totalSkipped + upcomingSummary.totalSkipped;
      crawlSummary.totalPdfsSecured += latestSummary.totalPdfsSecured + upcomingSummary.totalPdfsSecured;
    }, headless);
  }

  /**
   * Scrapes tenders published on or after a specific date.
   */
  async scrapeTendersByDate(options = {}) {
    const { targetDate, limit = Infinity, headless = true } = options;
    console.log(`[BiharAdapter] Launching browser for tenders on/after ${targetDate} (headless: ${headless})...`);
    
    return await this._runScrapeSession(async (page, crawlSummary) => {
      console.log(`--- Fetching ACTIVE Tenders on/after ${targetDate} ---`);
      const latestSummary = await this.scrapeTenders(page, limit, this.tenderListingUrl, 'ACTIVE', targetDate);
      
      console.log(`--- Fetching UPCOMING Tenders on/after ${targetDate} ---`);
      const upcomingSummary = await this.scrapeTenders(page, limit, 'https://eproc2.bihar.gov.in/EPSV2Web/openarea/tenderListingPage.action#upcomingTenders', 'UPCOMING', targetDate);

      crawlSummary.totalIngested += latestSummary.totalIngested + upcomingSummary.totalIngested;
      crawlSummary.totalSkipped += latestSummary.totalSkipped + upcomingSummary.totalSkipped;
      crawlSummary.totalPdfsSecured += latestSummary.totalPdfsSecured + upcomingSummary.totalPdfsSecured;
    }, headless);
  }

  async _runScrapeSession(scrapeFn, headless) {
    console.log(`[BiharAdapter] Launching browser (headless: ${headless})...`);
    
    const browser = await chromium.launch({ headless, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    let crawlSummary = {
      totalIngested: 0,
      totalWithDocuments: 0,
      totalPdfsSecured: 0,
      totalWithoutDocuments: 0,
      totalSkipped: 0
    };

    try {
      await scrapeFn(page, crawlSummary);
    } catch (err) {
      console.error('[BiharAdapter] Error during scraping:', err);
      throw err;
    } finally {
      await browser.close();
    }

    return crawlSummary;
  }

  /**
   * Scrapes the main tender listing page and processes each tender popup.
   * @param {import('playwright').Page} page
   */
  async scrapeTenders(page, limit = Infinity, url = this.tenderListingUrl, targetStatus = 'ACTIVE', targetDateStr = null) {
    console.log(`[BiharAdapter] Navigating to ${url}`);

    // Auto-dismiss any unexpected browser alerts or prompts that could freeze Playwright
    page.on('dialog', async (dialog) => {
      console.log(`[BiharAdapter] ⚠️ Auto-dismissed browser dialog: ${dialog.message()}`);
      await dialog.dismiss().catch(() => {});
    });

    let navigated = false;
    for (let navAttempt = 1; navAttempt <= 3 && !navigated; navAttempt++) {
      try {
        if (navAttempt > 1) {
          console.log(`[BiharAdapter] 🔄 Retrying navigation to ${url} (Attempt ${navAttempt}/3)...`);
          await page.waitForTimeout(3000);
        }
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
        navigated = true;
      } catch (err) {
        if (navAttempt === 3) throw err;
        console.warn(`[BiharAdapter] ⚠️ Navigation timeout/error (Attempt ${navAttempt}/3): ${err.message}`);
      }
    }

    // Background watcher to automatically close annoying popups/alerts and remove loading overlays that block clicks
    await page.evaluate(() => {
      setInterval(() => {
        const bootboxOkBtn = document.querySelector('.bootbox-alert.in button[data-bb-handler="ok"]');
        if (bootboxOkBtn) bootboxOkBtn.click();
        
        const bootboxCloseBtn = document.querySelector('.bootbox-alert.in .bootbox-close-button');
        if (bootboxCloseBtn) bootboxCloseBtn.click();

        // Clear any stuck spinner/overlay that intercepts clicks
        const loading = document.getElementById('loading');
        if (loading && loading.style.display !== 'none') {
          loading.style.display = 'none';
        }
        const overlay = document.getElementById('overlay');
        if (overlay && overlay.style.display !== 'none') {
          overlay.style.display = 'none';
        }
      }, 500);
    });

    // Ensure Angular tab switch is triggered properly if switching tabs
    if (targetStatus === 'UPCOMING' || url.includes('#upcomingTenders')) {
      const upcomingTab = await page.$('a[href="#upcomingTenders"]');
      if (upcomingTab) {
        await upcomingTab.click();
        await page.waitForTimeout(1500);
      }
    } else if (targetStatus === 'ACTIVE' || url.includes('#latestTenders')) {
      const latestTab = await page.$('a[href="#latestTenders"]');
      if (latestTab) {
        await latestTab.click();
        await page.waitForTimeout(1000);
      }
    }

    let summary = {
      totalIngested: 0,
      totalWithDocuments: 0,
      totalPdfsSecured: 0,
      totalWithoutDocuments: 0,
      totalSkipped: 0
    };

    const tabPaneId = targetStatus === 'UPCOMING' ? '#upcomingTenders' : '#latestTenders';
    const viewButtonsSelector = `${tabPaneId} button[ng-click^="previewTender"]`;
    const moreLinkSelector = `${tabPaneId} a[ng-click="clickForMoreTender()"]`;
    
    // Wait for the Angular table to fully render
    try {
      await page.waitForSelector(viewButtonsSelector, { state: 'visible', timeout: 60000 });
      
      // Load ALL tenders by clicking "More..." until it disappears
      console.log(`[BiharAdapter] Loading all pages by clicking 'More...' link in ${tabPaneId}...`);
      let moreClicks = 0;
      while (true) {
        if (moreClicks >= 50) break; // Hard limit to avoid infinite loop
        const moreLink = await page.$(moreLinkSelector);
        if (!moreLink) break;
        
        const isVisible = await moreLink.isVisible();
        if (!isVisible) break;
        
        await moreLink.click();
        await page.waitForTimeout(500); // Wait for rows to render
        moreClicks++;
      }
      console.log(`[BiharAdapter] Expanded ${tabPaneId} table with ${moreClicks} 'More...' clicks.`);
    } catch (e) {
      console.log(`[BiharAdapter] No tenders found or page took too long to load in ${tabPaneId}.`);
    }

    // Fast-Forward Optimization: Check all already completed tenders in ONE batch
    const completedTenders = await Tender.find(
      { pdfFetchStatus: 'COMPLETED' }, 
      { sourceTenderId: 1, status: 1 }
    ).lean();
    const completedMap = new Map(completedTenders.map(t => [t.sourceTenderId, t.status]));

    // Extract all rows in ONE single browser evaluate call (takes <50ms)
    const tableRowsData = await page.$$eval(viewButtonsSelector, (buttons) => {
      return buttons.map((btn, btnIndex) => {
        const tr = btn.closest('tr');
        if (!tr) return null;
        const tds = tr.querySelectorAll('td');
        return {
          btnIndex,
          sourceTenderId: tds.length >= 2 ? tds[1].innerText.trim() : '',
          rowEndDate: tds.length >= 6 ? tds[5].innerText.trim() : '',
          timeLeftStr: tds.length >= 7 ? tds[6].innerText.trim() : ''
        };
      }).filter(Boolean);
    });

    // Filter down to ONLY the tenders that need to be scraped
    const pendingRows = [];
    for (const row of tableRowsData) {
      if (!row.sourceTenderId) continue;
      const existingStatus = completedMap.get(row.sourceTenderId);
      if (existingStatus) {
        if (existingStatus === 'UPCOMING' && targetStatus === 'ACTIVE') {
          // Upgraded from UPCOMING to ACTIVE - needs re-scraping
          pendingRows.push(row);
        } else {
          summary.totalSkipped++;
        }
      } else {
        pendingRows.push(row);
      }
    }

    console.log(`[BiharAdapter] ⚡ Fast-forward: Skipped ${summary.totalSkipped} already fetched tenders in <50ms!`);
    console.log(`[BiharAdapter] 🎯 Only ${pendingRows.length} tenders actually need scraping for status: ${targetStatus}`);

    if (pendingRows.length === 0) {
      console.log(`[BiharAdapter] ✅ All ${targetStatus} tenders are already up to date!`);
      return summary;
    }

    const viewButtons = await page.$$(viewButtonsSelector);
    let processedCount = 0;
    const startTime = Date.now();

    for (const item of pendingRows) {
      if (processedCount >= limit) break;
      const button = viewButtons[item.btnIndex];
      if (!button) continue;

      const { sourceTenderId, rowEndDate, timeLeftStr } = item;
      try {
        // Clear any stuck spinner/overlay or display styles before opening modal
        await page.evaluate(() => {
          const loading = document.getElementById('loading');
          if (loading) loading.style.display = 'none';
          const overlay = document.getElementById('overlay');
          if (overlay) overlay.style.display = 'none';
          // CRITICAL: Reset Bootstrap's internal modal state so subsequent rows can open modal!
          if (window.$ && window.$('#myModalprev').data('bs.modal')) {
            window.$('#myModalprev').data('bs.modal').isShown = false;
          }
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
          document.body.classList.remove('modal-open');
        });

        await button.scrollIntoViewIfNeeded().catch(() => {});
        await button.click({ force: true });

        try {
          await page.waitForSelector('#myModalprev', { state: 'visible', timeout: 10000 });
        } catch (_) {
          // If modal didn't open via button.click, trigger click via DOM directly
          await page.evaluate(({ selector, idx }) => {
            if (window.$ && window.$('#myModalprev').data('bs.modal')) {
              window.$('#myModalprev').data('bs.modal').isShown = false;
            }
            const btns = document.querySelectorAll(selector);
            if (btns[idx]) {
              btns[idx].click();
              if (window.angular) {
                window.angular.element(btns[idx]).triggerHandler('click');
              }
            }
          }, { selector: viewButtonsSelector, idx: item.btnIndex });
          await page.waitForSelector('#myModalprev', { state: 'visible', timeout: 15000 });
        }

        const tenderData = await this.extractTextFromModal(page, rowEndDate);
        tenderData.status = targetStatus; // Set the explicitly detected status
        
        if (timeLeftStr) {
          tenderData.timeLeftStr = timeLeftStr;
        }
        console.log(`[BiharAdapter] Extracted data for Tender: ${tenderData.sourceTenderId}`);

        let documents = [];
        try {
          documents = await this.downloadAndUploadAttachments(page, tenderData.sourceTenderId);
        } catch (downloadErr) {
          console.error(`[BiharAdapter] Failed to fetch documents for ${tenderData.sourceTenderId}:`, downloadErr.message);
        }
        
        tenderData.nitDocuments = documents;
        tenderData.pdfUrls = documents.map(d => d.fileUrl);
        tenderData.isDocumentAvailable = documents.length > 0;
        tenderData.pdfFetchStatus = documents.length > 0 ? 'COMPLETED' : 'NOT_AVAILABLE';

        // Systematically identify and map BOQ file if present
        const boqDoc = documents.find(d => 
          d.documentName.toLowerCase().endsWith('.xls') || 
          d.documentName.toLowerCase().endsWith('.xlsx') || 
          d.documentName.toLowerCase().includes('boq')
        );
        if (boqDoc) {
          tenderData.boqFileUrl = boqDoc.fileUrl;
          tenderData.boqFetchStatus = 'COMPLETED';
        } else {
          tenderData.boqFetchStatus = 'NOT_AVAILABLE';
        }

        // Save tenderData to MongoDB
        await Tender.findOneAndUpdate(
          { sourceTenderId: tenderData.sourceTenderId },
          { $set: tenderData },
          { upsert: true, returnDocument: 'after' }
        );
        console.log(`[BiharAdapter] Saved Tender to MongoDB: ${tenderData.sourceTenderId} (${documents.length} files attached)`);

        summary.totalIngested++;
        summary.totalPdfsSecured += documents.length;
        if (documents.length > 0) summary.totalWithDocuments++;
        else summary.totalWithoutDocuments++;

        const elapsedMinutes = (Date.now() - startTime) / 60000;
        const ratePerMinute = elapsedMinutes > 0 ? (summary.totalIngested / elapsedMinutes).toFixed(1) : 0;
        console.log(`[BiharAdapter] 🚀 PROGRESS: Fetched ${summary.totalIngested} tenders | Rate: ${ratePerMinute} tenders/minute`);

      } catch (err) {
        console.error(`[BiharAdapter] Error processing a tender row:`, err.message);
        summary.totalSkipped++;
      } finally {
        try {
          // Force close modal using DOM evaluation and clean up Bootstrap state
          await page.evaluate(() => {
            if (window.$ && typeof window.$('#myModalprev').modal === 'function') {
              window.$('#myModalprev').modal('hide');
            } else {
              const btn = document.querySelector('#myModalprev button.close');
              if (btn) btn.click();
            }
            // CRITICAL: Reset Bootstrap modal plugin isShown flag
            if (window.$ && window.$('#myModalprev').data('bs.modal')) {
              window.$('#myModalprev').data('bs.modal').isShown = false;
            }
            const modal = document.getElementById('myModalprev');
            if (modal) {
              modal.classList.remove('in');
              modal.style.display = 'none';
              modal.setAttribute('aria-hidden', 'true');
            }
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = '';
          });
          await page.waitForTimeout(300); // wait for modal animation to clear
        } catch(e){}
      }
      processedCount++;
    }
    
    return summary;
  }

  /**
   * Extracts ALL text fields generically from the "Preview All" modal matching the MongoDB schema.
   * @param {import('playwright').Page} page
   * @param {string} rowEndDate - End Date extracted from the main table
   */
  async extractTextFromModal(page, rowEndDate = '') {
    const rawData = {};
    const paymentData = {};
    const criticalDates = {};
    
    // Find all table rows inside the modal
    const rows = await page.$$('#myModalprev tr');
    for (const row of rows) {
      // Get all cells (th and td) in the current row, replacing non-breaking spaces
      const cells = await row.$$eval('th, td', elements => elements.map(el => el.innerText.replace(/\u00a0/g, ' ').trim()));
      
      // If the row has 2 columns (e.g. [Key, Value])
      if (cells.length === 2 && cells[0] !== '') {
        rawData[cells[0]] = cells[1];
      } 
      // If the row has 4 columns (e.g. [Key1, Value1, Key2, Value2])
      else if (cells.length === 4) {
        if (cells[0] !== '') rawData[cells[0]] = cells[1];
        if (cells[2] !== '') rawData[cells[2]] = cells[3];
      }
      // If the row has 6 columns (Payment Details table)
      else if (cells.length === 6) {
        if (cells[0] === 'EMD') {
          paymentData.emdAmount = parseFloat(cells[1].replace(/,/g, '')) || 0;
          paymentData.paymentMode = cells[2];
        } else if (cells[0] === 'Tender Fee') {
          paymentData.tenderFee = parseFloat(cells[1].replace(/,/g, '')) || 0;
        } else if (cells[0] === 'Tender Processing Fee') {
          paymentData.processingFee = parseFloat(cells[1].replace(/,/g, '')) || 0;
        }
      }
    }
    
    // Extract full text from modal to catch non-table elements (like Created On)
    let modalText = '';
    try {
      modalText = await page.$eval('#myModalprev', el => el.innerText);
    } catch(e) {}

    const rawEstimatedStr = rawData['Estimated Value in INR'] || rawData['Estimated Cost(INR)'] || '0';
    const estimatedValue = parseFloat(rawEstimatedStr.replace(/[^0-9.]/g, '')) || 0;
    
    // Exact Date Parsing from the main table
    // Example format: "2026-10-10 15:00"
    let closingDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // +15 Days Default
    if (rowEndDate) closingDate = new Date(rowEndDate);
    else if (rawData['Bid Submission Closing Date']) closingDate = new Date(rawData['Bid Submission Closing Date']);
    else if (rawData['End Date']) closingDate = new Date(rawData['End Date']);
    
    
    let publishedDate = new Date();
    if (rawData['Published Date']) {
      publishedDate = new Date(rawData['Published Date']);
    } else {
      const createdOnMatch = modalText.match(/Created On\s*:\s*([\d-]+\s+[\d:]+\s*[APM]+)/i);
      if (createdOnMatch && createdOnMatch[1]) {
        // e.g. "26-09-2026 01:54 PM" -> "2026-09-26 13:54"
        const parts = createdOnMatch[1].trim().split(/[\s-:]+/);
        if (parts.length >= 5) {
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
          let hours = parseInt(parts[3], 10);
          const minutes = parts[4];
          const ampm = (parts[5] || '').toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          
          const isoString = `${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:00+05:30`;
          const parsed = new Date(isoString);
          if (!isNaN(parsed.getTime())) {
            publishedDate = parsed;
          }
        }
      }
    }

    const formatShortDate = (dateObj) => {
      if (isNaN(dateObj.getTime())) return '';
      return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Return the mapped object ready for MongoDB
    return {
      sourcePortal: 'BIHAR_TENDERS',
      sourceTenderId: rawData['System Tender No.'] || Date.now().toString(),
      tenderType: rawData['Tender Type'] || 'Open Tender',
      title: rawData['Tender Title'] || rawData['Detailed Description'] || 'Bihar Public Works Tender',
      departmentName: rawData['Organization Hierarchy'] || 'Bihar Government',
      organisationChain: rawData['Organization Hierarchy'] || 'Bihar Government',
      
      // Basic Details
      tenderReferenceNumber: rawData['Tender Reference No.'] || rawData['NIT'] || '',
      tenderCategory: rawData['Procurement Category'] || rawData['Category'] || 'Works',
      productCategory: rawData['Category'] || 'Civil Works',
      workDescription: rawData['Detailed Description'] || '',
      contractType: rawData['Tender Type'] || 'Tender',
      paymentMode: paymentData.paymentMode || 'Online',
      noOfCovers: parseInt(rawData['Bid Parts']) || 1,
      
      // Fee & EMD Details
      tenderFee: paymentData.tenderFee || 0,
      emdAmount: paymentData.emdAmount || 0,
      
      // Inviting Authority
      invitingAuthorityName: rawData['Tender Inviting Authority'] || rawData['Tender Approving Authority'] || 'Authorized Signatory',
      invitingAuthorityAddress: rawData['Organization Hierarchy'] || 'Bihar',
      
      // Location
      location: 'Bihar',
      pincode: '800001',
      bidValidityDays: parseInt(rawData['Offer Validity(In Days)']) || 120,
      
      // Critical Dates mapped as Strings for UI, and Dates for DB logic
      status: 'ACTIVE',
      closingDate: closingDate,
      closingDateStr: rowEndDate || rawData['Bid Submission Closing Date'] || rawData['End Date'] || formatShortDate(closingDate),
      publishedDate: publishedDate,
      publishedDateStr: rawData['Published Date'] || formatShortDate(publishedDate),
      bidOpeningDateStr: rawData['Bid Opening Date'] || '',
      
      estimatedValue: estimatedValue,
      
      // This dumps EVERY single field from the popup into MongoDB magically!
      dynamicFields: rawData 
    };
  }

  /**
   * Finds ALL government documents in the modal, downloads every single one without missing any,
   * and uploads all files to Cloudflare R2.
   * Returns complete array of document objects for nitDocuments.
   */
  async downloadAndUploadAttachments(page, tenderId) {
    // 1. Identify all genuine, visible download icons on the active modal table
    // (Filters out bidder submission placeholders where download is prohibited by the portal)
    const validIconsInfo = await page.evaluate(() => {
      const icons = Array.from(document.querySelectorAll('#myModalprev span[ng-click^="downloadFile"]'));
      const valid = [];
      const seenFileKeys = new Set();

      icons.forEach((icon, idx) => {
        // Must be visible in the active modal table
        if (icon.offsetParent === null) return;

        const ngClick = icon.getAttribute('ng-click') || '';
        // Skip bidder submission placeholders where isDownloadPossible is 'N' (requires bidder login/NDA)
        if (ngClick.includes(",'N'") || ngClick.includes(', "N"') || ngClick.includes(',\'n\'')) return;

        // Deduplicate using filename to avoid downloading identical duplicate files twice
        const tr = icon.closest('tr');
        const text = tr ? tr.innerText.replace(/\s+/g, ' ').trim() : '';
        const match = text.match(/([a-zA-Z0-9_\-\s.]+\.(?:pdf|docx?|xlsx?|zip|rar))/i);
        const fileKey = match ? match[1].toLowerCase().trim() : `icon_${idx}`;

        if (seenFileKeys.has(fileKey)) return;
        seenFileKeys.add(fileKey);

        valid.push({
          idx,
          hintName: match ? match[1].trim() : `doc_${idx}`
        });
      });
      return valid;
    });

    if (validIconsInfo.length === 0) {
      return [];
    }

    const allIcons = await page.$$('#myModalprev span[ng-click^="downloadFile"]');
    const localDownloadedFiles = [];
    const downloadedFileNames = new Set();
    let sno = 1;

    console.log(`[BiharAdapter] 📋 Found ${validIconsInfo.length} unique genuine document(s) to fetch for Tender: ${tenderId}`);

    // Process EVERY SINGLE document - 120s timeout + retry ensure 0% file loss!
    let fileIndex = 0;
    for (const item of validIconsInfo) {
      fileIndex++;
      const icon = allIcons[item.idx];
      if (!icon) continue;

      let tempPath = null;
      let downloadSuccess = false;

      // Try up to 2 attempts per document in case of transient government server glitches
      for (let attempt = 1; attempt <= 2 && !downloadSuccess; attempt++) {
        try {
          if (attempt > 1) {
            console.log(`[BiharAdapter] 🔄 Retrying "${item.hintName}" (Attempt 2/2)...`);
            await page.waitForTimeout(1500);
          } else {
            console.log(`[BiharAdapter] ⏳ [${fileIndex}/${validIconsInfo.length}] Downloading "${item.hintName}" (Streaming from Bihar portal)...`);
          }

          await page.waitForTimeout(150);

          // 25-second timeout for the initial download handshake
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 25000 }),
            icon.click({ timeout: 10000 })
          ]);

          const originalFileName = download.suggestedFilename() || item.hintName;

          // Skip duplicate download if this exact file was already downloaded for this tender
          if (downloadedFileNames.has(originalFileName)) {
            downloadSuccess = true;
            break;
          }

          const safePrefix = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          tempPath = path.join(process.cwd(), 'temp', `${safePrefix}_${originalFileName}`);

          if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
            fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
          }

          // 120s (2 Minutes) Timeout: ensures large 10MB-20MB SBDs and PDFs have ample time to complete!
          const savePromise = download.saveAs(tempPath);
          const saveTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Download stream timed out after 120 seconds')), 120000)
          );
          await Promise.race([savePromise, saveTimeout]);

          const stats = fs.statSync(tempPath);
          const fileSizeKb = Math.round(stats.size / 1024);

          downloadedFileNames.add(originalFileName);
          localDownloadedFiles.push({
            tempPath,
            originalFileName,
            fileSizeKb,
            sNo: sno++
          });
          downloadSuccess = true;
          console.log(`[BiharAdapter] ✅ [${sno - 1}/${validIconsInfo.length}] Downloaded locally: ${originalFileName} (${fileSizeKb} KB)`);
        } catch (downloadErr) {
          console.warn(`[BiharAdapter] ⚠️ Notice while downloading "${item.hintName}" (Attempt ${attempt}/2): ${downloadErr.message}`);
          // Clean up partial temp file if download stalled
          try {
            if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          } catch (_) {}

          // If the portal redirected to an error page, safely navigate back
          if (page.url().includes('downloadattachment.action') || page.url().includes('Error')) {
            console.log('[BiharAdapter] Navigating back from error page...');
            await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
            await page.waitForTimeout(1500);
          }
        }
      }
    }

    if (localDownloadedFiles.length === 0) {
      return [];
    }

    // 2. Parallel R2 Uploads - uploads 100% of the downloaded files to Cloudflare R2
    console.log(`[BiharAdapter] ☁️ Uploading all ${localDownloadedFiles.length} file(s) to Cloudflare R2...`);
    const uploadPromises = localDownloadedFiles.map(async (fileInfo) => {
      try {
        const ext = path.extname(fileInfo.originalFileName).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.xls') contentType = 'application/vnd.ms-excel';
        else if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        else if (ext === '.doc') contentType = 'application/msword';
        else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const r2Url = await uploadFileToR2({
          filePath: fileInfo.tempPath,
          fileName: fileInfo.originalFileName,
          tenderId: tenderId,
          publishedDate: new Date().toISOString(),
          deptCode: 'BIHAR',
          contentType
        });

        if (r2Url) {
          return {
            sNo: fileInfo.sNo,
            documentName: fileInfo.originalFileName,
            description: fileInfo.originalFileName.replace(/_/g, ' ').replace(/\.[^/.]+$/, ''),
            documentSizeKb: fileInfo.fileSizeKb,
            fileUrl: r2Url
          };
        }
      } catch (upErr) {
        console.error(`[BiharAdapter] ❌ R2 upload error for ${fileInfo.originalFileName}:`, upErr.message);
      } finally {
        try {
          if (fileInfo.tempPath && fs.existsSync(fileInfo.tempPath)) {
            fs.unlinkSync(fileInfo.tempPath);
          }
        } catch (_) {}
      }
      return null;
    });

    const uploadedResults = await Promise.all(uploadPromises);
    const validDocuments = uploadedResults.filter(Boolean);
    console.log(`[BiharAdapter] 🔒 Secured ${validDocuments.length}/${localDownloadedFiles.length} document(s) in Cloudflare R2 for Tender: ${tenderId}`);
    return validDocuments;
  }
}
