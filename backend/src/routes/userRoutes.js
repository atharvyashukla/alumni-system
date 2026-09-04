import { Router } from 'express';
import { attachUserCollege } from '../controllers/collegeController.js';
import { getCurrentUser } from '../controllers/authController.js';
import { setUserRole } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /users/me - Return current user with role, college, and profile details
router.get('/me', requireAuth, getCurrentUser);

// POST /users/me/college - Attach logged-in user to a college
router.post('/me/college', requireAuth, attachUserCollege);

// POST /users/me/role - Set role ("student" or "alumni") for the logged-in user, only once
router.post('/me/role', requireAuth, setUserRole);

export default router;
