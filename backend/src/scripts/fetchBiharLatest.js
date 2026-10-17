import 'dotenv/config';
import BiharTenderAdapter from '../services/adapters/BiharTenderAdapter.js';
import { connectDB, closeDB } from '../config/db.js';

async function run() {
  await connectDB();
  const adapter = new BiharTenderAdapter();
  try {
    const limit = parseInt(process.argv[2], 10) || 50;
    console.log(`🚀 Starting fetchBiharLatest (Scraping Latest ${limit} Active and Upcoming Tenders)`);
    const summary = await adapter.scrapeLatestTenders({ limit, headless: true });
    console.log("✅ Finished scraping:", summary);
  } catch (err) {
    console.error("❌ Scraping failed:", err);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

run();
