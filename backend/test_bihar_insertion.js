import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tender from './src/models/Tender.js';

dotenv.config();

async function testBiharInsertion() {
  try {
    // Connect to your local or test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bihartenders_test');
    console.log('Connected to Database');

    // Data mapped directly from PDF 1 (Bihar Engineering College Aurangabad)
    const biharTenderData = {
      sourcePortal: 'BIHAR_TENDERS',
      sourceTenderId: '139128',
      tenderReferenceNumber: 'GEC/Abad/securty/2025-26/02',
      title: 'outsourcing of service of security guard, housekeeping, staff and gardener in government engineering college, aurangabad, Bihar',
      workDescription: 'outsourcing of service of security guard ,housekeeping(including sweeper),staff and gardener in government engineering college,aurangabad,Bihar.',
      
      // New Bihar Specific Fields we added to schema
      templateGroup: 'BR_Lump Sum Rate V 1.5',
      bidParts: 2,
      category: 'ITEM RATE',
      procurementCategory: 'GENERAL',
      biddingCurrency: 'INR',
      estimatedValueVisibilityFlag: 'N',
      minimumNumberOfBids: 2,
      rankingSequence: 'L1 Ranking',
      bidValidityDays: 180,
      
      invitingAuthorityName: 'Dr. Prashant Mani (Principal Incharge)',
      departmentName: 'Department of Science and Technology, HQ',
      organisationChain: 'Government of Bihar->Department of Science and Technology',

      // Dates
      bidSubmissionStartDateStr: '02-09-2026 06:30 PM',
      bidSubmissionEndDateStr: '09-10-2026 05:00 PM',
      bidOpeningDateStr: '12-10-2026 10:00 AM',
      
      preBidDiscussionType: 'OFFLINE',
      preBidMeetingPlace: 'conference hall, gec aurangabad',
      
      // Payment (Tender Fee & EMD)
      tenderFee: 5000,
      emdAmount: 200000,
      paymentMode: 'Internet Payment Gateway(IPG),Challan|Bank Guarantee',
      
      // General Particulars mapping
      generalParticulars: [
        { description: 'name of the bidder' },
        { description: 'complete postal address' },
        { description: 'email id' },
        { description: 'contact details' },
        { description: 'pan details' },
        { description: 'gst details' }
      ],

      // Required Attachments mapping
      requiredAttachments: [
        {
          supportingDocument: 'certificate of incorporation/Registration of Bidder',
          mandatory: 'Y',
          allowExemption: 'N',
          attachmentGroup: 'Others',
          evaluationType: 'BidPart1'
        },
        {
          supportingDocument: 'AUDITED BALANCE SHEET AND PROFIT AND LOSS ACCOUNT OF LAST THREE FINANCIAL YEAR',
          mandatory: 'Y',
          allowExemption: 'N',
          attachmentGroup: 'Others',
          evaluationType: 'BidPart1'
        }
      ],

      // BOQ Items
      boqItems: [
        {
          itemCode: 'SERVICE 01',
          itemName: 'SERVICE CHARGE PER MANPOWER PER MONTH',
          uom: 'No',
          quantity: 1,
          estimatedCost: 0,
          boqAttachment: 'ANNEXURE 7.pdf',
          mandatoryItem: 'Yes'
        }
      ],

      // DEMONSTRATING FLEXIBILITY: What if a completely new field appears in PDF 5?
      dynamicFields: {
        newBiharSpecificTaxCode: 'BHR-TAX-998822',
        specialUndertakingRequired: true,
        someUnmappedPDFTable: {
          row1: 'Data A',
          row2: 'Data B'
        }
      },
      
      // Because we set { strict: false }, we can also just pass fields directly at the root!
      completelyRandomFieldFromFuturePDF: "This field wasn't in our Mongoose Schema, but it will save!"
    };

    // Upsert the data
    const result = await Tender.findOneAndUpdate(
      { sourcePortal: biharTenderData.sourcePortal, sourceTenderId: biharTenderData.sourceTenderId },
      { $set: biharTenderData },
      { new: true, upsert: true }
    );

    console.log('Successfully inserted/updated flexible Bihar Tender!');
    console.log(`Saved Tender ID: ${result._id}`);
    console.log(`Dynamic Tax Code saved: ${result.dynamicFields.newBiharSpecificTaxCode}`);
    console.log(`Unmapped Field saved: ${result._doc.completelyRandomFieldFromFuturePDF}`);

  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from Database');
  }
}

testBiharInsertion();
