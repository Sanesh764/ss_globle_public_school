

import mongoose from 'mongoose';
import dns from 'dns';
import logger from '../utils/logger.js';

dns.setServers(['1.1.1.1','8.8.8.8']);
/**
 * Helper to resolve SRV records for mongodb+srv URIs using custom public DNS servers
 * when local OS/network DNS resolvers fail to resolve _mongodb._tcp SRV records.
 */
const resolveSrvUri = async (srvUri) => {
  try {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?$/);
    if (!match) return null;

    const [, username, password, host, dbName] = match;
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

// Register connection lifecycle listeners for automatic reconnects and diagnostics
mongoose.connection.on('disconnected', () => {
  logger.warn('[Database] MongoDB Atlas connection lost. Mongoose is attempting reconnection...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('[Database] MongoDB Atlas reconnected successfully.');
});

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    logger.error('[Database Error] FATAL: MONGO_URI environment variable is missing!');
    logger.error('[Database Error] Please configure a valid MongoDB Atlas connection string in your .env file.');
    throw new Error('MONGO_URI environment variable is required to connect to MongoDB Atlas.');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    logger.info(`[Database] MongoDB Atlas connected successfully`);
    return conn;
  } catch (primaryError) {
    logger.warn(`[Database] Primary Atlas connection attempt failed: ${primaryError.message}`);

    // If SRV DNS lookup failed on mongodb+srv, attempt custom public DNS SRV resolver fallback
    if (mongoUri.startsWith('mongodb+srv://')) {
      logger.info('[Database] Resolving Atlas SRV record via public DNS resolver fallback...');
      const resolvedUri = await resolveSrvUri(mongoUri);

      if (resolvedUri) {
        try {
          const conn = await mongoose.connect(resolvedUri);
          logger.info(`[Database] Connected to MongoDB Atlas via resolved hosts: ${conn.connection.host}`);
          return conn;
        } catch (resolvedErr) {
          logger.error(`[Database Error] Resolved Atlas URI connection failed: ${resolvedErr.message}`);
        }
      }
    }

    logger.error('[Database Error] FATAL: Unable to establish connection to MongoDB Atlas.');
    logger.error('[Database Error] Troubleshooting checklist:');
    logger.error('  1. Verify your current public IP is added to the IP Access List in MongoDB Atlas (Security -> Network Access).');
    logger.error('  2. Verify your MONGO_URI username, password, and database name in .env.');
    logger.error('  3. Ensure outbound TCP traffic on port 27017 is not blocked by a firewall.');
    throw primaryError;
  }
};

export default connectDB;
