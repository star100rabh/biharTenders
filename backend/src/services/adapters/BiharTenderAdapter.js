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
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Background watcher to automatically close annoying popups/alerts that block clicks
    await page.evaluate(() => {
      setInterval(() => {
        const bootboxOkBtn = document.querySelector('.bootbox-alert.in button[data-bb-handler="ok"]');
        if (bootboxOkBtn) bootboxOkBtn.click();
        
        const bootboxCloseBtn = document.querySelector('.bootbox-alert.in .bootbox-close-button');
        if (bootboxCloseBtn) bootboxCloseBtn.click();
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
      await page.waitForSelector(viewButtonsSelector, { state: 'visible', timeout: 30000 });
      
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

    const viewButtons = await page.$$(viewButtonsSelector); 
    console.log(`[BiharAdapter] Found ${viewButtons.length} total tenders to scrape for status: ${targetStatus}`);
    
    let processedCount = 0;
    const startTime = Date.now();
    
    for (const button of viewButtons) {
      if (processedCount >= limit) break;
      try {
        // Extract Tender ID (2nd col), Closing Date (6th col) and Time Left (7th col) from main table
        const { sourceTenderId, rowEndDate, timeLeftStr } = await button.evaluate(btn => {
          const tr = btn.closest('tr');
          if (!tr) return { sourceTenderId: '', rowEndDate: '', timeLeftStr: '' };
          const tds = tr.querySelectorAll('td');
          return {
            sourceTenderId: tds.length >= 2 ? tds[1].innerText.trim() : '',
            rowEndDate: tds.length >= 6 ? tds[5].innerText.trim() : '',
            timeLeftStr: tds.length >= 7 ? tds[6].innerText.trim() : ''
          };
        });

        if (sourceTenderId) {
          const existingTender = await Tender.findOne({ sourceTenderId });
          // If we already have it and all PDFs are fetched, skip clicking completely to save massive time
          if (existingTender && existingTender.pdfFetchStatus === 'COMPLETED') {
            if (existingTender.status === 'UPCOMING' && targetStatus === 'ACTIVE') {
              console.log(`[BiharAdapter] 🚀 Tender ${sourceTenderId} upgraded from UPCOMING to ACTIVE. Re-scraping for new docs.`);
            } else {
              console.log(`[BiharAdapter] ⚡ Fast-forward: Tender ${sourceTenderId} already fully fetched. Skipping modal click.`);
              summary.totalSkipped++;
              processedCount++;
              continue;
            }
          }
        }

        // Small delay to prevent complete blockage but keep it fast
        await page.waitForTimeout(200);

        await button.click();
        await page.waitForSelector('#myModalprev', { state: 'visible' });

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

        // Save tenderData to MongoDB
        await Tender.findOneAndUpdate(
          { sourceTenderId: tenderData.sourceTenderId },
          { $set: tenderData },
          { upsert: true, new: true, returnDocument: 'after' }
        );
        console.log(`[BiharAdapter] Saved Tender to MongoDB: ${tenderData.sourceTenderId}`);

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
          // Force close modal using DOM evaluation to avoid actionability timeouts
          await page.evaluate(() => {
            const btn = document.querySelector('#myModalprev button.close');
            if (btn) btn.click();
            // Fallback: hide modal manually if click fails
            const modal = document.getElementById('myModalprev');
            if (modal) {
                modal.classList.remove('in');
                modal.style.display = 'none';
            }
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
            document.body.classList.remove('modal-open');
          });
          await page.waitForTimeout(500); // wait for modal animation to clear
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
      // Get all cells (th and td) in the current row
      const cells = await row.$$eval('th, td', elements => elements.map(el => el.innerText.trim()));
      
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
   * Finds all download icons in the modal, downloads them, compresses, and uploads to R2.
   * Returns array of document objects for nitDocuments
   */
  async downloadAndUploadAttachments(page, tenderId) {
    const downloadIcons = await page.$$('span[ng-click^="downloadFile"]:visible');
    let documents = [];
    let sno = 1;

    for (const icon of downloadIcons) {
      try {
        await page.waitForTimeout(300); // Tiny delay to prevent click drops
        // Setup Playwright to intercept the file download (max 30 seconds)
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 30000 }),
          icon.click()
        ]);
        
        const originalFileName = download.suggestedFilename();
        
        // Define a temporary path to save the file
        const tempPath = path.join(process.cwd(), 'temp', originalFileName);
        
        // Ensure temp directory exists
        if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
          fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
        }

        await download.saveAs(tempPath);
        console.log(`[BiharAdapter] Downloaded locally: ${originalFileName}`);

        // Get file size
        const stats = fs.statSync(tempPath);
        const fileSizeKb = Math.round(stats.size / 1024);

        // Upload to Cloudflare R2 with 50s timeout safeguard
        console.log(`[BiharAdapter] Uploading to R2: ${originalFileName}`);
        
        const uploadPromise = uploadFileToR2({
          filePath: tempPath,
          fileName: originalFileName,
          tenderId: tenderId,
          publishedDate: new Date().toISOString(), // Fallback date if not parsed yet
          deptCode: 'BIHAR',
          contentType: originalFileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'
        });
        const uploadTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('R2 upload timed out after 50 seconds')), 50000)
        );

        const r2Url = await Promise.race([uploadPromise, uploadTimeout]);

        if (r2Url) {
          documents.push({
            sNo: sno++,
            documentName: originalFileName,
            description: originalFileName.replace(/_/g, ' ').replace('.pdf', ''),
            documentSizeKb: fileSizeKb,
            fileUrl: r2Url
          });
        }
      } catch (downloadErr) {
        console.log(`[BiharAdapter] Failed to download or upload an attachment: ${downloadErr.message}`);
        // If the portal redirected us to an error page instead of downloading, go back!
        if (page.url().includes('downloadattachment.action') || page.url().includes('Error')) {
          console.log('[BiharAdapter] Stuck on error page! Navigating back...');
          await page.goBack({ waitUntil: 'networkidle' }).catch(() => {});
          await page.waitForTimeout(2000); // Give it a moment to render the modal again
        }
      } finally {
        // Guarantee cleanup of local temp file
        try {
          if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        } catch (cleanupErr) {}
      }
    }
    return documents;
  }
}
