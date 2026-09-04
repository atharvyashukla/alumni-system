import { Router } from 'express';
import {
  createMentorshipRequest,
  getMentorshipRequests,
  updateMentorshipRequestStatus,
  suggestMentorsWithAI,
} from '../controllers/mentorshipController.js';
import { requireAuth } from '../middleware/auth.js';
import { enforceTenantScope } from '../middleware/tenantScope.js';

const router = Router();

// POST /mentorship-requests - Submit mentorship request to alumni
router.post('/mentorship-requests', requireAuth, enforceTenantScope, createMentorshipRequest);

// GET /mentorship-requests - View mentorship requests (supports ?asStudent=true or ?asAlumni=true)
router.get('/mentorship-requests', requireAuth, enforceTenantScope, getMentorshipRequests);

// PATCH /mentorship-requests/:id - Accept or decline mentorship request
router.patch('/mentorship-requests/:id', requireAuth, enforceTenantScope, updateMentorshipRequestStatus);

// POST /mentorship/suggest - AI Mentor Matching via Google Gemini
router.post('/mentorship/suggest', requireAuth, enforceTenantScope, suggestMentorsWithAI);

export default router;
