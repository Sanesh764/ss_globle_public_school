import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { seedInitialData } from './src/utils/seedData.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database & Seed Initial Data then start HTTP server
connectDB().then(async () => {
  await seedInitialData();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` S.S. Global Public School Server Running on Port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` API Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}).catch((err) => {
  console.error('[Server Error] Failed to initialize server:', err.message);
});
