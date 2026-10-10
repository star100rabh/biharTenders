import { chromium } from 'playwright';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load backend/.env from CWD

// Dynamically import the adapter AFTER dotenv has populated process.env
const { default: BiharTenderAdapter } = await import('../services/adapters/BiharTenderAdapter.js');
const { default: Tender } = await import('../models/Tender.js');

async function runBiharScraper() {
  console.log('🚀 Starting Bihar Tender Scraper Pipeline...');

  // 1. Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB (Bihar Database)');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }

  // 2. Launch Playwright Headless Browser
  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({
    headless: false, // Set to false so you can watch it working for now!
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // 3. Run the Adapter
  try {
    const args = process.argv.slice(2);
    const limitArg = args.find(a => !isNaN(parseInt(a, 10)));
    const limit = limitArg ? parseInt(limitArg, 10) : Infinity;

    const adapter = new BiharTenderAdapter();
    console.log(`🏃 Executing Bihar Adapter Logic... (Limit: ${limit === Infinity ? 'All' : limit})`);
    await adapter.fetchTendersByDate({ limit, headless: true });
    console.log('🎉 Scraping Finished Successfully!');
  } catch (error) {
    console.error('❌ Error during scraping:', error);
  } finally {
    // 4. Cleanup
    await browser.close();
    await mongoose.disconnect();
    console.log('🛑 Browser closed and Database disconnected.');
  }
}

// Execute
runBiharScraper();
