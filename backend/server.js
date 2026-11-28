import mongoose from 'mongoose';
import app from './src/app.js';
import connectDB from './src/config/db.js';

// Validate required security environment variables on startup
const jwtSecret = process.env.JWT_SECRET;
const placeholderSecrets = ['replace_with_a_secure_random_jwt_secret_key_2026', 'your_jwt_secret', 'secret'];
if (!jwtSecret || jwtSecret.trim() === '' || placeholderSecrets.includes(jwtSecret.trim())) {
  console.error('[SECURITY ERROR] Insecure or missing JWT_SECRET environment variable.');
  console.error('[SECURITY ERROR] Please provide a valid, secure JWT_SECRET in your .env file.');
  process.exit(1);
}

// Railway dynamic PORT configuration with fallback
const PORT = process.env.PORT || 8080;

let server;

// Connect to Database and start HTTP server (NO automatic production seeding)
connectDB().then(() => {
  server = app.listen(PORT, () => {
    console.log(` [STARTUP] S.S. Global Public School Server Running on Port ${PORT}`);
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
