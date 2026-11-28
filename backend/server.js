import 'dotenv/config';
import mongoose from 'mongoose';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { isCloudinaryConfigured } from './src/config/cloudinary.js';

// Validate required security and database environment variables on startup
const jwtSecret = process.env.JWT_SECRET;
const placeholderSecrets = ['replace_with_a_secure_random_jwt_secret_key_2026', 'your_jwt_secret', 'secret'];
if (!jwtSecret || jwtSecret.trim() === '' || placeholderSecrets.includes(jwtSecret.trim())) {
  console.error('[SECURITY ERROR] Insecure or missing JWT_SECRET environment variable.');
  console.error('[SECURITY ERROR] Please provide a valid, secure JWT_SECRET in your environment.');
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri || mongoUri.trim() === '') {
  console.error('[DATABASE ERROR] Missing MONGO_URI environment variable.');
  console.error('[DATABASE ERROR] Please provide a valid MongoDB Atlas connection string.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && !isCloudinaryConfigured()) {
  console.error('[STORAGE ERROR] Missing Cloudinary credentials in production.');
  console.error(
    '[STORAGE ERROR] Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
  );
  process.exit(1);
}

// Railway dynamic PORT configuration with fallback
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';

let server;

// Connect to Database and start HTTP server (NO automatic production seeding)
connectDB().then(() => {
  server = app.listen(PORT, HOST, () => {
    console.log(`[STARTUP] S.S. Global Public School Server Running on ${HOST}:${PORT}`);
  });
  // Align timeouts with Railway / reverse-proxy idle keep-alive windows
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}).catch((err) => {
  console.error('[DATABASE ERROR] Failed to initialize server:', err.message);
  process.exit(1);
});

// Graceful Shutdown Handler for Railway & Container Lifecycles
const gracefulShutdown = (signal) => {
  console.log(`[SHUTDOWN] ${signal} signal received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('[SHUTDOWN] HTTP server closed cleanly.');
      try {
        await mongoose.connection.close();
        console.log('[DATABASE] MongoDB connection closed cleanly.');
        process.exit(0);
      } catch (err) {
        console.error('[SHUTDOWN ERROR] Failed to close MongoDB connection:', err.message);
        process.exit(1);
      }
    });

    // Fallback timeout to force exit if shutdown hangs over 10 seconds
    setTimeout(() => {
      console.error('[SHUTDOWN ERROR] Forced shutdown due to 10s timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  console.error('[PROCESS ERROR] Unhandled Promise Rejection:', message);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('[PROCESS ERROR] Uncaught Exception:', err.message);
  gracefulShutdown('uncaughtException');
});
