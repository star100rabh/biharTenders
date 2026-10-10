import 'dotenv/config';
import BiharTenderAdapter from '../services/adapters/BiharTenderAdapter.js';
import { connectDB, closeDB } from '../config/db.js';

async function run() {
  await connectDB();
  const adapter = new BiharTenderAdapter();
  try {
    console.log("🚀 Starting fetchBiharLatest (Scraping Latest 50 Active and Upcoming Tenders)");
    const summary = await adapter.scrapeLatestTenders({ limit: 50, headless: true });
    console.log("✅ Finished scraping:", summary);
  } catch (err) {
    console.error("❌ Scraping failed:", err);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

run();
