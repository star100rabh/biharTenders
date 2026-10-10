import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const TenderSchema = new mongoose.Schema({}, { strict: false });
const Tender = mongoose.model('Tender', TenderSchema);

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const oldUrl = 'pub-8a7cea61b87543e2ac1a32186ef4cd82.r2.dev';
  const newUrl = 'pub-3d1ab448176343dab2cf2a63a5794172.r2.dev';

  const tenders = await Tender.find({});
  let updatedCount = 0;

  for (const tender of tenders) {
    let needsUpdate = false;
    
    // Fix tender.pdf
    if (tender._doc.tenderDocumentR2Url && tender._doc.tenderDocumentR2Url.includes(oldUrl)) {
      tender._doc.tenderDocumentR2Url = tender._doc.tenderDocumentR2Url.replace(oldUrl, newUrl);
      needsUpdate = true;
    }

    // Fix otherImportantDocuments
    if (tender._doc.otherImportantDocuments && Array.isArray(tender._doc.otherImportantDocuments)) {
      for (const doc of tender._doc.otherImportantDocuments) {
        if (doc.r2Url && doc.r2Url.includes(oldUrl)) {
          doc.r2Url = doc.r2Url.replace(oldUrl, newUrl);
          needsUpdate = true;
        }
      }
    }

    if (needsUpdate) {
      await tender.updateOne({ $set: tender._doc });
      updatedCount++;
    }
  }

  console.log(`Updated URLs in ${updatedCount} tenders.`);
  await mongoose.disconnect();
}

main().catch(console.error);
