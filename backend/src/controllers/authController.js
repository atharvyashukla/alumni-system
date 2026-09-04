import prisma from '../config/db.js';
import { generateToken } from '../utils/token.js';

// In-memory demo store for when PostgreSQL is not running locally
const inMemoryUsers = new Map();

/**
 * Handles successful OAuth authentication callback and redirects to frontend with token
 */
export const handleOAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    const token = generateToken(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Redirect to frontend auth callback route with token
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
  }
};

/**
 * POST /auth/dev-login
 * Dev & testing login endpoint to simulate OAuth without external cloud credentials.
 * Includes automatic in-memory fallback if local PostgreSQL is not running or migrated.
 */
export const devLogin = async (req, res) => {
  try {
    const {
      email = 'demo.student@csjmu.ac.in',
      fullName = 'Demo Student',
      role = 'pending',
      collegeId = null,
      provider = 'google',
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    let user = null;
    let isDbConnected = true;

    try {
      // Attempt PostgreSQL Query
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          college: true,
          studentProfile: true,
          alumniProfile: true,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            fullName: fullName.trim(),
            role,
            collegeId,
            provider,
          },
          include: {
            college: true,
            studentProfile: true,
            alumniProfile: true,
          },
        });
      }
    } catch (dbError) {
      console.warn('⚠️ PostgreSQL unreachable or tables not migrated:', dbError.message);
      isDbConnected = false;

      // In-Memory Dev Mode Fallback:
      const existing = inMemoryUsers.get(normalizedEmail);
      if (existing) {
        user = existing;
      } else {
        const demoUserId = `user-${Date.now()}`;
        const demoCollege = collegeId
          ? {
              id: collegeId,
              name: 'Chhatrapati Shahu Ji Maharaj University (CSJMU)',
              city: 'Kanpur',
              state: 'Uttar Pradesh',
              domain: 'csjmu.ac.in',
            }
          : null;

        let studentProfile = null;
        let alumniProfile = null;

        if (role === 'student') {
          studentProfile = {
            id: `sp-${Date.now()}`,
            userId: demoUserId,
            collegeId: collegeId || 'csjmu-demo-id',
            branch: 'Computer Science and Engineering',
            currentYear: '3rd Year',
            enrollmentYear: 2023,
            expectedGraduationYear: 2027,
          };
        } else if (role === 'alumni') {
          alumniProfile = {
            id: `ap-${Date.now()}`,
            userId: demoUserId,
            collegeId: collegeId || 'csjmu-demo-id',
            batchYear: 2019,
            branch: 'Computer Science and Engineering',
            currentCompany: 'Google India',
            designation: 'Senior Software Engineer',
            sector: 'IT/Software',
            city: 'Bengaluru',
            linkedinUrl: 'https://linkedin.com/in/priyasharma-demo',
            isVerified: true,
          };
        }

        user = {
          id: demoUserId,
          email: normalizedEmail,
          fullName: fullName.trim(),
          role,
          provider,
          collegeId: collegeId || (role !== 'pending' ? 'csjmu-demo-id' : null),
          college: demoCollege || (role !== 'pending' ? {
            id: 'csjmu-demo-id',
            name: 'Chhatrapati Shahu Ji Maharaj University (CSJMU)',
            city: 'Kanpur',
            state: 'Uttar Pradesh',
          } : null),
          studentProfile,
          alumniProfile,
          createdAt: new Date().toISOString(),
        };

        inMemoryUsers.set(normalizedEmail, user);
      }
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: isDbConnected
        ? 'Dev login successful.'
        : 'Dev login successful (In-Memory Dev Mode - PostgreSQL disconnected).',
      isDemoMode: !isDbConnected,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        provider: user.provider,
        collegeId: user.collegeId,
        college: user.college,
        studentProfile: user.studentProfile,
        alumniProfile: user.alumniProfile,
      },
    });
  } catch (error) {
    console.error('Dev Login Unhandled Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete dev login.',
      error: error.message,
    });
  }
};

/**
 * GET /users/me or GET /auth/me
 * Returns current authenticated user profile, assigned college, and student/alumni profiles.
 */
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in.',
      });
    }

    let user = null;

    try {
      user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          college: true,
          studentProfile: true,
          alumniProfile: true,
        },
      });
    } catch (dbErr) {
      console.warn('DB lookup failed in getCurrentUser, using session token fallback:', dbErr.message);
    }

    // If not found in DB or DB down, fallback to memory or decoded token
    if (!user) {
      user = inMemoryUsers.get(req.user.email?.toLowerCase()) || req.user;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Determine onboarding stage for frontend navigation
    let onboardingStage = 'ready';
    if (!user.collegeId) {
      onboardingStage = 'needs_college';
    } else if (!user.role || user.role === 'pending' || user.role === 'unassigned') {
      onboardingStage = 'needs_role';
    } else if (user.role === 'student' && !user.studentProfile) {
      onboardingStage = 'needs_student_profile';
    } else if (user.role === 'alumni' && !user.alumniProfile) {
      onboardingStage = 'needs_alumni_profile';
    }

    return res.status(200).json({
      success: true,
      onboardingStage,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        provider: user.provider || 'google',
        collegeId: user.collegeId,
        college: user.college,
        studentProfile: user.studentProfile,
        alumniProfile: user.alumniProfile,
        createdAt: user.createdAt || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current user information.',
      error: error.message,
    });
  }
};

export { inMemoryUsers };
