import mongoose from 'mongoose';
import dns from 'dns';
import logger from '../utils/logger.js';

// Resolve DNS SRV lookups reliably across operating systems and network environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS set error if restricted
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ss_global_school';
  const fallbackUri = 'mongodb://127.0.0.1:27017/ss_global_school';

  try {
    const conn = await mongoose.connect(primaryUri);
    logger.info(`[Database] Connected to MongoDB Atlas: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (primaryError) {
    logger.warn(`[Database] Primary MONGO_URI connection failed: ${primaryError.message}. Attempting fallback to local MongoDB...`);
    try {
      const conn = await mongoose.connect(fallbackUri);
      logger.info(`[Database] Connected to local MongoDB fallback: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      logger.error(`[Database Error] Both Primary and Fallback MongoDB connections failed: ${fallbackError.message}`);
      console.error(`Please ensure MongoDB service is running locally or MONGO_URI in .env is valid.`);
    }
  }
};

export default connectDB;
