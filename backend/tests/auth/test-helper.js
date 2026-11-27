import mongoose from 'mongoose';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';

export const TEST_DB_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/ss_global_test_auth_db';
export const TEST_JWT_SECRET = 'test_jwt_secret_for_ss_global_auth_testing_2026';

export const TEST_USERS = {
  superadmin: {
    name: 'Test Super Admin',
    email: 'test-admin@ssglobal.edu.in',
    username: 'testsuperadmin',
    password: 'SuperAdminPass@123',
    role: 'superadmin',
    isActive: true,
  },
  staff: {
    name: 'Test Staff Admin',
    email: 'test-staff@ssglobal.edu.in',
    username: 'teststaff',
    password: 'StaffAdminPass@123',
    role: 'staff',
    isActive: true,
  },
  inactive: {
    name: 'Test Inactive Staff',
    email: 'test-inactive@ssglobal.edu.in',
    username: 'testinactive',
    password: 'InactivePass@123',
    role: 'staff',
    isActive: false,
  },
};

let serverInstance = null;
let serverPort = null;

export async function setupTestEnvironment() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = TEST_JWT_SECRET;

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }

  // Clear existing test admin accounts
  await Admin.deleteMany({
    email: {
      $in: [
        TEST_USERS.superadmin.email,
        TEST_USERS.staff.email,
        TEST_USERS.inactive.email,
      ],
    },
  });

  // Seed isolated test accounts
  await Admin.create(TEST_USERS.superadmin);
  await Admin.create(TEST_USERS.staff);
  await Admin.create(TEST_USERS.inactive);

  // Start ephemeral HTTP server on random free port
  if (!serverInstance) {
    await new Promise((resolve) => {
      serverInstance = app.listen(0, '127.0.0.1', () => {
        serverPort = serverInstance.address().port;
        resolve();
      });
    });
  }

  return {
    baseUrl: `http://127.0.0.1:${serverPort}`,
    port: serverPort,
  };
}

export async function teardownTestEnvironment() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await Admin.deleteMany({
        email: {
          $in: [
            TEST_USERS.superadmin.email,
            TEST_USERS.staff.email,
            TEST_USERS.inactive.email,
          ],
        },
      });
      await mongoose.disconnect();
    }
  } catch (err) {
    // ignore teardown errors
  }

  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
    serverInstance = null;
    serverPort = null;
  }
}
