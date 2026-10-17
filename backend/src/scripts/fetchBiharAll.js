import 'dotenv/config';
import BiharTenderAdapter from '../services/adapters/BiharTenderAdapter.js';
import { connectDB, closeDB } from '../config/db.js';

async function run() {
  await connectDB();
  const adapter = new BiharTenderAdapter();
  try {
    const limit = parseInt(process.argv[2], 10) || 50000;
    console.log(`🚀 Starting fetchBiharAll (Scraping ALL Active and Upcoming Tenders, limit: ${limit})`);
    const summary = await adapter.scrapeAllTenders({ limit, headless: true });
    console.log("✅ Finished scraping:", summary);
  } catch (err) {
    console.error("❌ Scraping failed:", err);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

run();
