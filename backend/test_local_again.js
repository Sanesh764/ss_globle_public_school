import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/db.js';
import { seedInitialData } from './src/utils/seedData.js';
import app from './src/app.js';

async function testLocal() {
  await connectDB();
  await seedInitialData();
  const server = app.listen(5010, async () => {
    try {
      const res = await fetch('http://127.0.0.1:5010/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://main.dlzshhty32uyq.amplifyapp.com',
        },
        body: JSON.stringify({ email: 'admin@ssglobal.edu.in', password: 'Admin@123456' }),
      });
      const data = await res.json();
      console.log('Local Server Response Status:', res.status);
      console.log('Local Server CORS Origin Header:', res.headers.get('access-control-allow-origin'));
      console.log('Local Server Data Message:', data.message);
    } catch (e) {
      console.error(e);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}
testLocal();
