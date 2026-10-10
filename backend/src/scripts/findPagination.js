import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log("Navigating...");
  await page.goto('https://eproc2.bihar.gov.in/EPSV2Web/openarea/tenderListingPage.action', { waitUntil: 'domcontentloaded' });
  
  console.log("Waiting for Angular...");
  await page.waitForTimeout(10000); // just wait 10s for everything to load
  
  const html = await page.content();
  import('fs').then(fs => fs.writeFileSync('page_dump.html', html));
  console.log("Dumped to page_dump.html");
  
  await browser.close();
}
main().catch(console.error);
