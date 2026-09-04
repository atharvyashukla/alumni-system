import { Router } from 'express';
import { getEvents, createEvent } from '../controllers/eventController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { enforceTenantScope } from '../middleware/tenantScope.js';

const router = Router();

// GET /events - List events scoped to user's college
router.get('/', requireAuth, enforceTenantScope, getEvents);

// POST /events - Create a new event (admin only)
router.post('/', requireAuth, requireRole('admin', 'super_admin'), enforceTenantScope, createEvent);

export default router;
