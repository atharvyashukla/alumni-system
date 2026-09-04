import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

/**
 * Optional or mandatory JWT authentication middleware.
 * If Bearer token is present, verifies and loads user into req.user.
 * Falls back gracefully to token payload if local PostgreSQL is unreachable.
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      if (process.env.NODE_ENV === 'development' && req.headers['x-user-id']) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: req.headers['x-user-id'] },
            include: { college: true },
          });
          if (user) req.user = user;
        } catch (e) {
          // DB down fallback
        }
      }
      return next();
    }

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired authentication token.',
      });
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.id || decoded.userId },
        include: { college: true },
      });
    } catch (dbErr) {
      // If DB is offline, populate req.user directly from validated decoded JWT payload
      user = {
        id: decoded.id || decoded.userId,
        email: decoded.email,
        fullName: decoded.fullName || 'Member',
        role: decoded.role || 'student',
        collegeId: decoded.collegeId || null,
      };
    }

    if (!user) {
      user = {
        id: decoded.id || decoded.userId,
        email: decoded.email,
        fullName: decoded.fullName || 'Member',
        role: decoded.role || 'student',
        collegeId: decoded.collegeId || null,
      };
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return next();
  }
};

/**
 * Route guard that strictly requires req.user to be authenticated.
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.',
    });
  }
  next();
};

/**
 * Role-based authorization guard (e.g., requireRole('admin', 'super_admin'))
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
};
