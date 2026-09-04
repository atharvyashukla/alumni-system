import { Router } from 'express';
import { createDonation, getDonationsSummary } from '../controllers/donationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST /donations - Record a new donation
router.post('/', authenticateToken, createDonation);

// GET /donations/summary?collegeId=... - Donation statistics and leaderboard
router.get('/summary', authenticateToken, getDonationsSummary);

export default router;
