import express from 'express';
import {
  getAiPlans,
  getContractorProfile,
  updateContractorProfile,
  analyzeTender,
  getTenderDossier,
  postCopilotChat,
  getMyDossiers,
  submitContactForm,
} from '../controllers/services.controller.js';
import { verifyToken, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (pricing and plan comparison)
router.get('/plans', getAiPlans);
router.post('/contact', submitContactForm);

// Allow seamless AI analysis with optionalAuth (works for both logged-in and guest contractors)
router.use(optionalAuth);

router.get('/contractor-profile', getContractorProfile);
router.put('/contractor-profile', updateContractorProfile);

router.post('/analyze/:tenderId', analyzeTender);
router.get('/dossier/:tenderId', getTenderDossier);
router.post('/chat/:tenderId', postCopilotChat);
router.get('/my-dossiers', getMyDossiers);

export default router;
