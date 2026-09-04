import { Router } from 'express';
import { createAlumniProfile } from '../controllers/profileController.js';
import { getAlumniDirectory } from '../controllers/directoryController.js';
import { toggleAlumniVerification } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { enforceTenantScope } from '../middleware/tenantScope.js';

const router = Router();

// GET /alumni - Filtered alumni directory scoped to user's college
router.get('/', requireAuth, enforceTenantScope, getAlumniDirectory);

// POST /alumni/me - Create logged-in user's AlumniProfile
router.post('/me', requireAuth, createAlumniProfile);

// PATCH /alumni/:id/verify - Verify or unverify alumni account (Admin only)
router.patch('/:id/verify', requireAuth, requireRole('admin', 'super_admin'), enforceTenantScope, toggleAlumniVerification);

export default router;
