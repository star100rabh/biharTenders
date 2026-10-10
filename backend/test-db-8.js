import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const TenderSchema = new mongoose.Schema({}, { strict: false });
const Tender = mongoose.model('Tender', TenderSchema);

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const tender = await Tender.findOne({ "sourceTenderId": "140766" });
  console.log("workItemDocuments:", JSON.stringify(tender.workItemDocuments, null, 2));
  await mongoose.disconnect();
}

main().catch(console.error);
