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
import contactRoutes from './routes/contactRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Enable Trust Proxy for Railway, Render, and single reverse proxies
app.set('trust proxy', 1);

// 2. Allowed Origins Whitelist
const allowedOrigins = [
  'https://main.dlzshhty32uyq.amplifyapp.com',
  'https://ssglobalpublicschool.com',
  'https://www.ssglobalpublicschool.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      allowedOrigins.some((o) => origin.startsWith(o)) ||
      origin.endsWith('.amplifyapp.com') ||
      origin.endsWith('.up.railway.app') ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('ssglobalpublicschool.com');

    if (isAllowed) {
      return callback(null, true);
    }

    // Return callback(null, false) to let Express CORS reject cleanly without throwing a 500 error
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

// 3. Apply CORS at top level
app.use(cors(corsOptions));

// 4. Security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 5. Response Payload Compression
app.use(compression());

// 6. Safe MongoDB Operator Injection Defense (In-Place Key Sanitizer for Express 5 & Node 24)
const cleanMongoInput = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        cleanMongoInput(item);
      }
    });
    return obj;
  }

  Object.keys(obj).forEach((key) => {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleanMongoInput(obj[key]);
    }
  });

  return obj;
};

const sanitizeMongoInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') cleanMongoInput(req.body);
  if (req.query && typeof req.query === 'object') cleanMongoInput(req.query);
  if (req.params && typeof req.params === 'object') cleanMongoInput(req.params);
  next();
};

app.use(sanitizeMongoInput);

// 8. Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 9. Static Upload Directory Serving
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
app.use(express.static(uploadsPath));

// 10. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    schoolName: 'S.S. Global Public School API',
    frontendUrl: process.env.FRONTEND_URL || 'https://main.dlzshhty32uyq.amplifyapp.com',
    backendUrl: 'https://ssgloblepublicschool-production.up.railway.app',
    timestamp: new Date().toISOString(),
  });
});

// 11. API Routes
app.use('/api/admin', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/contact', contactRoutes);

// 12. Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
