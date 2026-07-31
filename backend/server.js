import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './src/app.js';
import connectDB from './src/config/db.js';

dotenv.config();

// Railway dynamic PORT configuration with fallback
const PORT = process.env.PORT || 8080;

let server;

// Connect to Database and start HTTP server (NO automatic production seeding)
connectDB().then(() => {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` [STARTUP] S.S. Global Public School Server Running on Port ${PORT}`);
    console.log(` [STARTUP] Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(` [STARTUP] Health Check Endpoint: /api/health`);
    console.log(`=======================================================`);
  });
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
