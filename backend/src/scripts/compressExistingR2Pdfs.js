import 'dotenv/config';
import { r2 } from '../utils/r2Storage.js';
import { ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';
import sharp from 'sharp';

async function compressBuffer(pdfBuffer) {
  const origSize = pdfBuffer.length;
  if (origSize < 100 * 1024) return pdfBuffer;

  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { 
      ignoreEncryption: true,
      parseSpeed: Infinity 
    });
    const context = pdfDoc.context;

    for (const [ref, obj] of context.enumerateIndirectObjects()) {
      if (obj instanceof PDFRawStream) {
        const dict = obj.dict;
        const subtype = dict.get(PDFName.of('Subtype'));
        
        if (subtype === PDFName.of('Image')) {
          try {
            const rawBytes = obj.contents;
            if (rawBytes && rawBytes.length > 40 * 1024) {
              const optimized = await sharp(Buffer.from(rawBytes))
                .jpeg({ quality: 65, mozjpeg: true })
                .toBuffer();

              if (optimized && optimized.length < rawBytes.length) {
                dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
                dict.set(PDFName.of('Length'), context.obj(optimized.length));
                obj.contents = optimized;
              }
            }
          } catch(e) {}
        }
      }
    }

    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setProducer('BiharTenders Optimization Engine');
    pdfDoc.setCreator('BiharTenders Platform');

    const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
    if (compressedBytes.length < origSize) {
      return Buffer.from(compressedBytes);
    }
  } catch (err) {}
  return pdfBuffer;
}

async function run() {
  const bucketName = process.env.R2_BUCKET_NAME;
  const targetMinSizeMb = parseFloat(process.argv[2]) || 6; // default files > 6MB
  const maxFiles = parseInt(process.argv[3], 10) || 50;

  console.log(`\n======================================================`);
  console.log(`🗜️  BiharTenders: Cloudflare R2 Retroactive PDF Compressor`);
  console.log(`🎯 Targeting PDFs larger than ${targetMinSizeMb} MB (Limit: ${maxFiles} files)`);
  console.log(`======================================================\n`);

  let isTruncated = true;
  let token = undefined;
  let candidates = [];

  while (isTruncated) {
    const res = await r2.send(new ListObjectsV2Command({
      Bucket: bucketName,
      ContinuationToken: token,
      MaxKeys: 1000
    }));

    if (res.Contents) {
      for (const item of res.Contents) {
        if (item.Key.toLowerCase().endsWith('.pdf') && item.Size >= targetMinSizeMb * 1024 * 1024) {
          candidates.push(item);
        }
      }
    }
    isTruncated = res.IsTruncated;
    token = res.NextContinuationToken;
  }

  // Sort largest first
  candidates.sort((a, b) => b.Size - a.Size);
  const toProcess = candidates.slice(0, maxFiles);
  console.log(`Found ${candidates.length} candidate PDFs >= ${targetMinSizeMb}MB. Processing top ${toProcess.length} largest files...\n`);

  let totalSavedBytes = 0;
  let processed = 0;

  for (const item of toProcess) {
    processed++;
    try {
      const getRes = await r2.send(new GetObjectCommand({ Bucket: bucketName, Key: item.Key }));
      const chunks = [];
      for await (const chunk of getRes.Body) chunks.push(chunk);
      const originalBuffer = Buffer.concat(chunks);
      const origSize = originalBuffer.length;

      const compressed = await compressBuffer(originalBuffer);
      const newSize = compressed.length;

      if (newSize < origSize) {
        await r2.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: item.Key,
          Body: compressed,
          ContentType: 'application/pdf'
        }));

        const saved = origSize - newSize;
        totalSavedBytes += saved;
        console.log(`[${processed}/${toProcess.length}] ✅ Compressed: ${(origSize/1024/1024).toFixed(2)}MB -> ${(newSize/1024/1024).toFixed(2)}MB (-${((saved/origSize)*100).toFixed(1)}%) | ${item.Key.split('/').pop()}`);
      } else {
        console.log(`[${processed}/${toProcess.length}] ⏩ Skipped (no reduction): ${item.Key.split('/').pop()}`);
      }
    } catch (err) {
      console.warn(`[${processed}/${toProcess.length}] ❌ Error on ${item.Key}: ${err.message}`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 Batch Compression Completed!`);
  console.log(`💾 Total Space Saved: ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB (${(totalSavedBytes / 1024 / 1024 / 1024).toFixed(3)} GB)`);
  console.log(`======================================================\n`);
}

run();
