import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const tender = await db.collection('tenders').findOne({ sourcePortal: 'BIHAR_TENDERS' }, { sort: { _id: -1 } });
  console.log(JSON.stringify(tender.dynamicFields || {}, null, 2));
  process.exit(0);
}
run().catch(console.error);
