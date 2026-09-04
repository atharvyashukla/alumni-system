import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import collegeRoutes from './routes/collegeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { authenticateToken } from './middleware/auth.js';
import prisma from './config/db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Passport initialization
app.use(passport.initialize());

// Global optional auth extractor (populates req.user if Bearer token present)
app.use(authenticateToken);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Ping database to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// API Root Information
app.get('/', (req, res) => {
  res.json({
    name: 'Alumni Data Intelligence & Relationship System API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        google: 'GET /auth/google',
        linkedin: 'GET /auth/linkedin',
        devLogin: 'POST /auth/dev-login',
        me: 'GET /auth/me or GET /users/me',
      },
      colleges: {
        list: 'GET /colleges',
        create: 'POST /colleges',
        attachUser: 'POST /users/me/college',
      },
      profiles: {
        setRole: 'POST /users/me/role',
        studentProfile: 'POST /students/me',
        alumniProfile: 'POST /alumni/me',
      },
      directory: 'GET /alumni?branch=...&batchYear=...&search=...',
      events: 'GET /events, POST /events (admin only)',
      jobs: 'GET /jobs, POST /jobs',
      mentorship: {
        requests: 'GET /mentorship-requests, POST /mentorship-requests, PATCH /mentorship-requests/:id',
        aiSuggestions: 'POST /mentorship/suggest',
      },
      donations: 'GET /donations/summary, POST /donations',
      admin: {
        users: 'GET /admin/users',
        verifyAlumni: 'PATCH /alumni/:id/verify',
      },
    },
  });
});

// Mount Routes
app.use('/auth', authRoutes);
app.use('/colleges', collegeRoutes);
app.use('/users', userRoutes);
app.use('/students', studentRoutes);
app.use('/alumni', alumniRoutes);
app.use('/events', eventRoutes);
app.use('/jobs', jobRoutes);
app.use('/donations', donationRoutes);
app.use('/admin', adminRoutes);
app.use('/', mentorshipRoutes); // Mounts /mentorship-requests and /mentorship/suggest

// 404 Catch-all handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Alumni Management API Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Colleges:     http://localhost:${PORT}/colleges`);
    console.log(` Directory:    http://localhost:${PORT}/alumni`);
    console.log(` Mentorship:   http://localhost:${PORT}/mentorship/suggest`);
    console.log(` Donations:    http://localhost:${PORT}/donations/summary`);
    console.log(` Admin Users:  http://localhost:${PORT}/admin/users`);
    console.log(`====================================================`);
  });
}

export default app;
