import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';


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
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Enable Trust Proxy for Railway, Render, and single reverse proxies
app.set('trust proxy', 1);

// 2. Allowed Origins Whitelist
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://main.dlzshhty32uyq.amplifyapp.com',
  'https://ssglobalpublicschool.com',
  'https://www.ssglobalpublicschool.com',
  process.env.FRONTEND_URL,
].filter(Boolean);


// 3. Preflight OPTIONS & Express CORS Middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    optionsSuccessStatus: 200,
  })
);

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

// 9. Root Health & Status Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'S.S. Global Public School API Server Running Cleanly',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// 10. API Health Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
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
app.use('/api/admin', authRoutes);
app.use('/api/academic-resources', publicAcademicResourceRouter);
app.use('/api/facilities', publicFacilityRouter);
app.use('/api/notices', noticeRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/contact', publicContactRouter);
app.use('/api/hero', heroRoutes);
app.use('/api/hero-slider', publicHeroSliderRouter);
app.use('/api/leadership', publicLeadershipRouter);

// 12. Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
