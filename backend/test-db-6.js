import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const TenderSchema = new mongoose.Schema({}, { strict: false });
const Tender = mongoose.model('Tender', TenderSchema);

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const tender = await Tender.findOne({ "sourceTenderId": "140766" });
  console.log("pdfUrls:", JSON.stringify(tender.pdfUrls, null, 2));
  console.log("boqFileUrl:", tender.boqFileUrl);
  await mongoose.disconnect();
}

main().catch(console.error);
