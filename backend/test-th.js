import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://eproc2.bihar.gov.in/EPSV2Web/openarea/tenderListingPage.action');
  await page.waitForSelector('table#ActiveTenders', { timeout: 30000 });
  
  // Click first preview icon
  const previewIcon = await page.$('i.fa-eye');
  if (previewIcon) {
    await previewIcon.click();
    await page.waitForSelector('#myModalprev', { state: 'visible' });
    await page.waitForTimeout(2000);
    
    // Dump all rows html
    const html = await page.$$eval('#myModalprev tr', rows => 
      rows.map(r => r.innerHTML).filter(h => h.includes('Date Schedule') || h.includes('Bid Submission Start Date') || h.includes('GENERAL PARTICULARS') || h.includes('Bid Validity')).join('\n---\n')
    );
    console.log(html);
  } else {
    console.log('No eye icon found');
  }
  await browser.close();
}
main().catch(console.error);
