import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
// Force IPv4 and public Google/Cloudflare DNS for SRV record lookups on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

console.log('--- Testing Environment & Services with Custom DNS ---');
console.log('MONGO_URI:', process.env.MONGO_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testServices() {
  try {
    const ping = await cloudinary.api.ping();
    console.log('[Cloudinary Test SUCCESS]:', ping);
  } catch (err) {
    console.error('[Cloudinary Test FAILED]:', err.message);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('[MongoDB Atlas Test SUCCESS]: Connected to host:', conn.connection.host);
    console.log('[MongoDB Atlas Database Name]:', conn.connection.name);
    await mongoose.disconnect();
  } catch (err) {
    console.error('[MongoDB Atlas Test FAILED]:', err.message);
  }
}

testServices();
