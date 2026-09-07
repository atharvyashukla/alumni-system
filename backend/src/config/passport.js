import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import prisma from './db.js';

// Configure Google OAuth Strategy
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const isGoogleConfigured =
  googleClientId &&
  googleClientSecret &&
  !googleClientId.includes('your_google_client_id') &&
  !googleClientSecret.includes('your_google_client_secret');

if (isGoogleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL:
        process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const fullName = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'Google User';

          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          // Check if user already exists
          let user = await prisma.user.findUnique({
            where: { email },
            include: { college: true },
          });

          // If new user, create without collegeId and initial pending role
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                fullName,
                provider: 'google',
                role: 'pending', // Pending role until user selects student/alumni
              },
              include: { college: true },
            });
          }

          return done(null, user);
        } catch (error) {
          console.error('Google Strategy Error:', error);
          return done(error, null);
        }
      }
    )
  );
  console.log('✔ Google OAuth strategy registered successfully.');
} else {
  console.warn('⚠️ Google OAuth credentials not set in .env. Real Google OAuth flow will be disabled until valid keys are configured.');
}

// Configure LinkedIn OAuth Strategy
const linkedInClientId = process.env.LINKEDIN_CLIENT_ID;
const linkedInClientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const isLinkedInConfigured =
  linkedInClientId &&
  linkedInClientSecret &&
  !linkedInClientId.includes('your_linkedin_client_id') &&
  !linkedInClientSecret.includes('your_linkedin_client_secret');

if (isLinkedInConfigured) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: linkedInClientId,
        clientSecret: linkedInClientSecret,
        callbackURL:
          process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:5000/auth/linkedin/callback',
        scope: ['openid', 'profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const fullName = profile.displayName || 'LinkedIn User';

          if (!email) {
            return done(new Error('No email found in LinkedIn profile'), null);
          }

          let user = await prisma.user.findUnique({
            where: { email },
            include: { college: true },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                fullName,
                provider: 'linkedin',
                role: 'pending',
              },
              include: { college: true },
            });
          }

          return done(null, user);
        } catch (error) {
          console.error('LinkedIn Strategy Error:', error);
          return done(error, null);
        }
      }
    )
  );
  console.log('✔ LinkedIn OAuth strategy registered successfully.');
} else {
  console.warn('⚠️ LinkedIn OAuth credentials not set in .env.');
}

export default passport;
