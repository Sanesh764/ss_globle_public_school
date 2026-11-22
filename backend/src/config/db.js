import mongoose from 'mongoose';
import dns from 'dns';
import logger from '../utils/logger.js';

dns.setServers(['1.1.1.1','8.8.8.8']);

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGO_URI;

  // Strict Production Check: Fail fast if MONGO_URI is missing in production
  if (isProduction && !mongoUri) {
    logger.error('[Database Error] FATAL: MONGO_URI environment variable is missing in production!');
    throw new Error('MONGO_URI is required in production environment.');
  }

  const primaryUri = mongoUri || 'mongodb://127.0.0.1:27017/ss_global_school';

  try {
    const conn = await mongoose.connect(primaryUri);
    logger.info(`[Database] MongoDB Atlas connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (primaryError) {
    logger.warn(`[Database] Primary MONGO_URI connection failed: ${primaryError.message}`);
   }
};

export default connectDB;
