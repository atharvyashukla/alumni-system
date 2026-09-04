import { Router } from 'express';
import {
  getAllColleges,
  createCollege,
  attachUserCollege,
} from '../controllers/collegeController.js';

const router = Router();

// GET /colleges - List all colleges
router.get('/', getAllColleges);

// POST /colleges - Register a new college
router.post('/', createCollege);

// POST /users/me/college - Attach logged-in user to college
router.post('/users/me/college', attachUserCollege);

export default router;
