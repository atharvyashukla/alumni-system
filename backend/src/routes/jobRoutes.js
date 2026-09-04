import { Router } from 'express';
import { getJobs, createJob } from '../controllers/jobController.js';
import { requireAuth } from '../middleware/auth.js';
import { enforceTenantScope } from '../middleware/tenantScope.js';

const router = Router();

// GET /jobs - List job postings scoped to user's college
router.get('/', requireAuth, enforceTenantScope, getJobs);

// POST /jobs - Post a job opportunity
router.post('/', requireAuth, enforceTenantScope, createJob);

export default router;
