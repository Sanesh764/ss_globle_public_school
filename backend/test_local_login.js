import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/db.js';
import { seedInitialData } from './src/utils/seedData.js';
import app from './src/app.js';

async function testLocalLogin() {
  await connectDB();
  await seedInitialData();
  const server = app.listen(5009, async () => {
    try {
      const res = await fetch('http://127.0.0.1:5009/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://main.dlzshhty32uyq.amplifyapp.com',
        },
        body: JSON.stringify({ email: 'admin@ssglobal.edu.in', password: 'Admin@123456' }),
      });
      const data = await res.json();
      console.log('--- LOCAL LOGIN TEST RESULT ---');
      console.log('HTTP Status:', res.status);
      console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
      console.log('Response Body:', data);
    } catch (e) {
      console.error(e);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}
testLocalLogin();
