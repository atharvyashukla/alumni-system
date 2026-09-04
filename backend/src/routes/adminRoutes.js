import { Router } from 'express';
import { getCollegeUsers } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { enforceTenantScope } from '../middleware/tenantScope.js';

const router = Router();

// GET /admin/users?collegeId=... - List all users under this college
router.get('/users', requireAuth, requireRole('admin', 'super_admin'), enforceTenantScope, getCollegeUsers);

export default router;
