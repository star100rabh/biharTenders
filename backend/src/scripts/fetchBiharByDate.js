import 'dotenv/config';
import BiharTenderAdapter from '../services/adapters/BiharTenderAdapter.js';
import { connectDB, closeDB } from '../config/db.js';

async function run() {
  await connectDB();
  const adapter = new BiharTenderAdapter();
  
  // Extract target date from arguments (e.g. "2026-10-09")
  const args = process.argv.slice(2);
  const targetDate = args[0];
  
  if (!targetDate) {
    console.error("❌ Please provide a target date in YYYY-MM-DD format.");
    console.log("Usage: npm run scrape:date -- 2026-10-09");
    process.exit(1);
  }

  try {
    console.log(`🚀 Starting fetchBiharByDate (Scraping Tenders published on or after ${targetDate})`);
    const summary = await adapter.scrapeTendersByDate({ targetDate, limit: 1000, headless: true });
    console.log("✅ Finished scraping:", summary);
  } catch (err) {
    console.error("❌ Scraping failed:", err);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

run();
