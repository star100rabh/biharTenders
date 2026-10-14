import { TenderSourceAdapter } from './TenderSourceAdapter.js';
import pino from 'pino';

const logger = pino();

export class DummyTenderAdapter extends TenderSourceAdapter {
  constructor() {
    // Call the parent constructor with the dummy portal name
    super('JK_TENDERS_DUMMY');
  }

  /**
   * Simulates an API call with a 1.5-second network delay
   */
  async fetchList(page = 1, filters = {}) {
    logger.info(`[Dummy API] Fetching mock tenders...`);

    return new Promise((resolve) => {
      setTimeout(() => {
        const dummyData = [
          {
            Title: "Construction of Road from Main Highway to Sector 4",
            TenderId: `JK-PWD-${Math.floor(Math.random() * 10000)}`,
            Category: "Civil Works",
            Department: "Public Works Department (PWD)",
            EstimatedValue: 5000000, 
            ClosingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            Status: "ACTIVE"
          },
          {
            Title: "Supply and Installation of IT Equipment for Govt Schools",
            TenderId: `BHR-EDU-${Math.floor(Math.random() * 10000)}`,
            Category: "IT Hardware",
            Department: "Department of Education, Bihar",
            EstimatedValue: 1200000, 
            ClosingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            Status: "ACTIVE"
          },
          {
            Title: "Maintenance of Nal-Jal Water Supply Lines in District Patna",
            TenderId: `BHR-PHED-${Math.floor(Math.random() * 10000)}`,
            Category: "Plumbing & Pipeline",
            Department: "Public Health Engineering Department (PHED Bihar)",
            EstimatedValue: 850000, 
            ClosingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            Status: "ACTIVE"
          }
        ];
        
        resolve(dummyData);
      }, 1500); // 1.5 seconds delay
    });
  }

  async fetchDetail(sourceTenderId) {
    logger.info(`[Dummy API] Fetching details for ${sourceTenderId}...`);
    return {}; 
  }

  /**
   * Normalizes the dummy raw data into our Mongoose schema format
   */
  normalize(rawTenderData) {
    return {
      title: rawTenderData.Title || 'Unknown Title',
      sourcePortal: this.portalName,
      sourceTenderId: rawTenderData.TenderId,
      state: 'Jammu and Kashmir',
      category: rawTenderData.Category,
      estimatedValue: rawTenderData.EstimatedValue,
      closingDate: new Date(rawTenderData.ClosingDate)
    };
  }
}