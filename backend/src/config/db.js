import mongoose from 'mongoose';
import dns from 'dns';
import logger from '../utils/logger.js';

/**
 * Helper to resolve SRV records for mongodb+srv URIs using custom DNS servers
 * when the default OS DNS resolver blocks SRV queries on port 53.
 */
const resolveSrvUri = async (srvUri) => {
  try {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?$/);
    if (!match) return null;

    const [, username, password, host, dbName, queryParams] = match;
    const srvDomain = `_mongodb._tcp.${host}`;

    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

    const addresses = await new Promise((resolve, reject) => {
      resolver.resolveSrv(srvDomain, (err, addrs) => {
        if (err) reject(err);
        else resolve(addrs);
      });
    });

    if (!addresses || addresses.length === 0) return null;

    const hostList = addresses.map((a) => `${a.name}:${a.port || 27017}`).join(',');
    const resolvedUri = `mongodb://${username}:${password}@${hostList}/${dbName}?ssl=true&authSource=admin&retryWrites=true&w=majority`;

    return resolvedUri;
  } catch (err) {
    logger.warn(`[Database SRV Resolver] Custom DNS SRV lookup failed: ${err.message}`);
    return null;
  }
};

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ss_global_school';

  try {
    const conn = await mongoose.connect(primaryUri);
    logger.info(`[Database] Connected to MongoDB Atlas: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (primaryError) {
    logger.warn(`[Database] Primary MONGO_URI SRV connection failed: ${primaryError.message}`);

    // If SRV DNS lookup failed on mongodb+srv, attempt custom SRV resolver
    if (primaryUri.startsWith('mongodb+srv://')) {
      logger.info('[Database] Resolving Atlas SRV record via public DNS (8.8.8.8)...');
      const resolvedUri = await resolveSrvUri(primaryUri);

      if (resolvedUri) {
        try {
          const conn = await mongoose.connect(resolvedUri);
          logger.info(`[Database] Successfully connected to MongoDB Atlas via resolved hosts: ${conn.connection.host}`);
          return conn;
        } catch (resolvedErr) {
          logger.error(`[Database Error] Resolved Atlas URI connection failed: ${resolvedErr.message}`);
        }
      }
    }

    // Attempt local fallback if running locally
    const fallbackUri = 'mongodb://127.0.0.1:27017/ss_global_school';
    try {
      const conn = await mongoose.connect(fallbackUri);
      logger.info(`[Database] Connected to local MongoDB fallback: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      logger.error(`[Database Error] All MongoDB connection attempts failed.`);
      throw primaryError;
    }
  }
};

export default connectDB;
