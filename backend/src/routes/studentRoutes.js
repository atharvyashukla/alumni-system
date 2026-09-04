import { Router } from 'express';
import { createStudentProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /students/me - Create logged-in user's StudentProfile
router.post('/me', requireAuth, createStudentProfile);

export default router;
