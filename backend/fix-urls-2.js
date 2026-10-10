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
    
    // Fix pdfUrls array
    if (tender._doc.pdfUrls && Array.isArray(tender._doc.pdfUrls)) {
      const fixedUrls = tender._doc.pdfUrls.map(url => {
        if (url && url.includes(oldUrl)) {
          needsUpdate = true;
          return url.replace(oldUrl, newUrl);
        }
        return url;
      });
      tender._doc.pdfUrls = fixedUrls;
    }

    // Fix boqFileUrl string
    if (tender._doc.boqFileUrl && tender._doc.boqFileUrl.includes(oldUrl)) {
      tender._doc.boqFileUrl = tender._doc.boqFileUrl.replace(oldUrl, newUrl);
      needsUpdate = true;
    }
    
    // Fix boqZipUrl string
    if (tender._doc.boqZipUrl && tender._doc.boqZipUrl.includes(oldUrl)) {
      tender._doc.boqZipUrl = tender._doc.boqZipUrl.replace(oldUrl, newUrl);
      needsUpdate = true;
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
