import { Router } from 'express';
import passport from '../config/passport.js';
import { handleOAuthCallback, devLogin, getCurrentUser } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Check if credentials exist
const isGoogleConfigured =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CLIENT_ID.includes('your_google_client_id');

const isLinkedInConfigured =
  process.env.LINKEDIN_CLIENT_ID &&
  process.env.LINKEDIN_CLIENT_SECRET &&
  !process.env.LINKEDIN_CLIENT_ID.includes('your_linkedin_client_id');

// --- GOOGLE OAUTH ROUTES ---
router.get('/google', (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.status(400).json({
      success: false,
      message:
        'Google OAuth is not configured yet. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env, or use POST /auth/dev-login for quick testing.',
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!isGoogleConfigured) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
    }
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`,
    })(req, res, next);
  },
  handleOAuthCallback
);

// --- LINKEDIN OAUTH ROUTES ---
router.get('/linkedin', (req, res, next) => {
  if (!isLinkedInConfigured) {
    return res.status(400).json({
      success: false,
      message:
        'LinkedIn OAuth is not configured yet. Please add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to backend/.env, or use POST /auth/dev-login for quick testing.',
    });
  }
  passport.authenticate('linkedin', { session: false })(req, res, next);
});

router.get(
  '/linkedin/callback',
  (req, res, next) => {
    if (!isLinkedInConfigured) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
    }
    passport.authenticate('linkedin', {
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`,
    })(req, res, next);
  },
  handleOAuthCallback
);

// --- DEV TESTING LOGIN ---
router.post('/dev-login', devLogin);

// --- CURRENT USER AUTH STATUS ---
router.get('/me', requireAuth, getCurrentUser);

export default router;
