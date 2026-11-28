import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';


import authRoutes from './routes/authRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import heroRoutes from './routes/hero.routes.js';
import { publicLeadershipRouter, adminLeadershipRouter } from './routes/leadershipRoutes.js';
import { publicHeroSliderRouter, adminHeroSliderRouter } from './routes/heroSliderRoutes.js';
import { publicContactRouter, adminContactRouter } from './routes/contactRoutes.js';
import { publicFacilityRouter, adminFacilityRouter } from './routes/facilityRoutes.js';
import { publicAcademicResourceRouter, adminAcademicResourceRouter } from './routes/academicResourceRoutes.js';
import { publicVideoRouter, adminVideoRouter } from './routes/videoRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import adminApplicationRoutes from './routes/adminApplicationRoutes.js';
import adminStudentRoutes from './routes/adminStudentRoutes.js';
import adminAttendanceRoutes from './routes/adminAttendanceRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Enable Trust Proxy for Railway, Render, and single reverse proxies
app.set('trust proxy', 1);

// 2. Allowed Origins Whitelist (exclude local dev origins in production)
const isProduction = process.env.NODE_ENV === 'production';
const frontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set([
  'https://www.ssglobalpublicschool.com',
  'https://ssglobalpublicschool.com',
  ...frontendOrigins,
  ...(!isProduction ? ['http://localhost:5173', 'http://127.0.0.1:5173'] : []),
]);

// 3. Express CORS Middleware (supports credentials & preflight for allowlisted origins)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.trim().replace(/\/+$/, '');
    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(
      Object.assign(new Error('Origin not allowed by CORS'), { statusCode: 403 })
    );
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// 4. Security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 5. Response Compression
app.use(compression());

// 6. Request Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. Cookie Parser
app.use(cookieParser());

// 8. Static Assets Serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 9. Robots.txt Handler (Serves backend crawler directives)
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nSitemap: https://www.ssglobalpublicschool.com/sitemap.xml\n');
});

// 10. Favicon Request Handler (Prevents 404 log noise)
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// 11. Root Health & Status Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'S.S. Global Public School API Server Running Cleanly',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// 12. API Health Route (distinguishes app liveness from MongoDB readiness)
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'OK' : 'DEGRADED',
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 11. API Routes
app.use('/api/admin/academic-resources', adminAcademicResourceRouter);
app.use('/api/admin/messages', adminContactRouter);
app.use('/api/admin/hero-slider', adminHeroSliderRouter);
app.use('/api/admin/leadership', adminLeadershipRouter);
app.use('/api/admin/facilities', adminFacilityRouter);
app.use('/api/admin/videos', adminVideoRouter);
app.use('/api/admin/applications', adminApplicationRoutes);
app.use('/api/admin/students', adminStudentRoutes);
app.use('/api/admin/attendance', adminAttendanceRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/academic-resources', publicAcademicResourceRouter);
app.use('/api/facilities', publicFacilityRouter);
app.use('/api/videos', publicVideoRouter);
app.use('/api/notices', noticeRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/contact', publicContactRouter);
app.use('/api/hero', heroRoutes);
app.use('/api/hero-slider', publicHeroSliderRouter);
app.use('/api/leadership', publicLeadershipRouter);
app.use('/api/registrations', registrationRoutes);

// 12. Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
