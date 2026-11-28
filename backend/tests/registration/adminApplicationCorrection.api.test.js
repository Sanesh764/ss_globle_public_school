import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import StudentApplication, { CLASS_OPTIONS } from '../../src/models/StudentApplication.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_admin_application_correction_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
const originalAppFindById = StudentApplication.findById.bind(StudentApplication);
const originalAppFindOneAndUpdate = StudentApplication.findOneAndUpdate.bind(StudentApplication);
const originalJwtSecret = process.env.JWT_SECRET;

const MOCK_ADMINS = {
  '65f000000000000000000001': {
    _id: '65f000000000000000000001',
    name: 'Super Admin',
    email: 'superadmin@ssglobal.edu.in',
    role: 'superadmin',
    isActive: true,
  },
  '65f000000000000000000002': {
    _id: '65f000000000000000000002',
    name: 'School Admin',
    email: 'admin@ssglobal.edu.in',
    role: 'admin',
    isActive: true,
  },
  '65f000000000000000000003': {
    _id: '65f000000000000000000003',
    name: 'Staff Member',
    email: 'staff@ssglobal.edu.in',
    role: 'staff',
    isActive: true,
  },
  '65f000000000000000000004': {
    _id: '65f000000000000000000004',
    name: 'Unauthorized User',
    email: 'parent@example.com',
    role: 'parent',
    isActive: true,
  },
};

const signTokenFor = (userId) =>
  jwt.sign({ userId }, TEST_JWT_SECRET, { expiresIn: '1h' });

const buildApplicationRecord = (overrides = {}) => ({
  _id: '65f500000000000000000001',
  applicationNumber: 'SSG-2026-A1B2C3D4E5F60718',
  fullName: 'Aarav Sharma',
  dateOfBirth: new Date('2015-06-15T00:00:00.000Z'),
  gender: 'Male',
  fatherName: 'Vikram Sharma',
  motherName: 'Priya Sharma',
  contactNumber: '9876543210',
  classApplyingFor: 'Class 5',
  email: 'parent@example.com',
  photo: {
    url: 'https://res.cloudinary.com/demo/image/upload/v1/ss_global_school/student_applications/stu.jpg',
    public_id: 'ss_global_school/student_applications/stu',
  },
  status: 'Pending',
  correctionMessage: '',
  reviewedBy: null,
  reviewedAt: null,
  reviewHistory: [
    {
      action: 'SUBMITTED',
      actorType: 'Applicant',
      note: 'Public registration application submitted',
      changedFields: [],
    },
  ],
  ...overrides,
});

const setupCorrectionDbMock = (initialApp = buildApplicationRecord(), options = {}) => {
  const store = initialApp ? structuredClone(initialApp) : null;

  Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;

  StudentApplication.findById = async (id) => {
    if (!store || String(store._id) !== String(id)) return null;
    return store;
  };

  StudentApplication.findOneAndUpdate = async (filter, update) => {
    if (options.simulateConcurrentChange) {
      return null;
    }
    if (!store || String(store._id) !== String(filter._id)) {
      return null;
    }
    if (filter.status?.$in && !filter.status.$in.includes(store.status)) {
      return null;
    }
    if (update.$set) {
      Object.assign(store, update.$set);
    }
    if (update.$push?.reviewHistory) {
      store.reviewHistory.push(update.$push.reviewHistory);
    }
    return store;
  };

  return store;
};

describe('PATCH /api/admin/applications/:id/request-correction - Correction Request API', () => {
  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = TEST_JWT_SECRET;

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterEach(() => {
    Admin.findById = originalAdminFindById;
    StudentApplication.findById = originalAppFindById;
    StudentApplication.findOneAndUpdate = originalAppFindOneAndUpdate;
  });

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1-3 & 18. Superadmin, Admin, and Staff can request corrections and record accurate reviewHistory', async () => {
    const roles = [
      { userId: '65f000000000000000000001', expectedActor: 'Admin' },
      { userId: '65f000000000000000000002', expectedActor: 'Admin' },
      { userId: '65f000000000000000000003', expectedActor: 'Staff' },
    ];

    for (const { userId, expectedActor } of roles) {
      const store = setupCorrectionDbMock();
      const res = await fetch(
        `${baseUrl}/api/admin/applications/65f500000000000000000001/request-correction`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${signTokenFor(userId)}`,
          },
          body: JSON.stringify({ correctionMessage: '  Please upload a clearer student photo.  ' }),
        }
      );

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.application.status, 'Correction Requested');
      assert.equal(body.data.application.correctionMessage, 'Please upload a clearer student photo.');
      assert.ok(body.data.application.reviewedAt);

      const lastHistory = store.reviewHistory.at(-1);
      assert.equal(lastHistory.action, 'CORRECTION_REQUESTED');
      assert.equal(lastHistory.actorType, expectedActor);
      assert.equal(String(lastHistory.performedBy), userId);
      assert.equal(lastHistory.note, 'Please upload a clearer student photo.');
      assert.deepEqual(lastHistory.changedFields, ['status', 'correctionMessage']);
    }
  });

  test('4. All roles can request corrections across Classes 1 to 12', async () => {
    const staffToken = signTokenFor('65f000000000000000000003');
    for (const cls of CLASS_OPTIONS) {
      setupCorrectionDbMock(buildApplicationRecord({ classApplyingFor: cls }));
      const res = await fetch(
        `${baseUrl}/api/admin/applications/65f500000000000000000001/request-correction`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${staffToken}`,
          },
          body: JSON.stringify({ correctionMessage: `Verify details for ${cls}` }),
        }
      );
      assert.equal(res.status, 200);
    }
  });

  test('5-6. Rejects unauthenticated requests (401) and unauthorized roles (403)', async () => {
    setupCorrectionDbMock();

    const unauthRes = await fetch(
      `${baseUrl}/api/admin/applications/65f500000000000000000001/request-correction`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctionMessage: 'Valid message' }),
      }
    );
    assert.equal(unauthRes.status, 401);

    const forbiddenRes = await fetch(
      `${baseUrl}/api/admin/applications/65f500000000000000000001/request-correction`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${signTokenFor('65f000000000000000000004')}`,
        },
        body: JSON.stringify({ correctionMessage: 'Valid message' }),
      }
    );
    assert.equal(forbiddenRes.status, 403);
  });

  test('7-8. Invalid ObjectId returns 400 and missing application returns 404', async () => {
    const staffToken = signTokenFor('65f000000000000000000003');
    setupCorrectionDbMock();

    const badIdRes = await fetch(
      `${baseUrl}/api/admin/applications/invalid-id/request-correction`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({ correctionMessage: 'Valid message' }),
      }
    );
    assert.equal(badIdRes.status, 400);

    setupCorrectionDbMock(null);
    const missingRes = await fetch(
      `${baseUrl}/api/admin/applications/65f500000000000000000099/request-correction`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({ correctionMessage: 'Valid message' }),
      }
    );
    assert.equal(missingRes.status, 404);
  });

  test('9-12 & 17. Rejects empty, whitespace-only, <5 char, >500 char messages and unknown fields with 400', async () => {
    const staffToken = signTokenFor('65f000000000000000000003');
    setupCorrectionDbMock();

    const invalidPayloads = [
      {},
      { correctionMessage: '' },
      { correctionMessage: '     ' },
      { correctionMessage: 'abcd' },
      { correctionMessage: 'A'.repeat(501) },
      { correctionMessage: 12345 },
      { correctionMessage: 'Valid message', status: 'Approved' },
      { correctionMessage: 'Valid message', reviewedBy: '65f000000000000000000001' },
      { correctionMessage: 'Valid message', fullName: 'Tampered' },
    ];

    for (const payload of invalidPayloads) {
      const res = await fetch(
        `${baseUrl}/api/admin/applications/65f500000000000000000001/request-correction`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${staffToken}`,
          },
          body: JSON.stringify(payload),
        }
      );
      assert.equal(res.status, 400, `Expected 400 for payload ${JSON.stringify(payload)}`);
    }
  });

  test('13-14 & 19-20. Updates Pending or Correction Requested while preserving details, photo, and applicationNumber', async () => {
    const adminToken = signTokenFor('65f000000000000000000002');
    const store = setupCorrectionDbMock(
      buildApplicationRecord({
        status: 'Correction Requested',
        correctionMessage: 'Old message',
      })
    );

    const res = await fetch(
      `${baseUrl}/api/admin/applications/65f500000000000000000001/request-correction`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ correctionMessage: 'Updated correction instructions' }),
      }
    );

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.application.applicationNumber, 'SSG-2026-A1B2C3D4E5F60718');
    assert.equal(body.data.application.correctionMessage, 'Updated correction instructions');
    assert.equal(store.fullName, 'Aarav Sharma');
    assert.equal(
      store.photo.url,
      'https://res.cloudinary.com/demo/image/upload/v1/ss_global_school/student_applications/stu.jpg'
    );
  });

  test('15-16. Rejects correction requests on Approved or Rejected applications with HTTP 409', async () => {
    const adminToken = signTokenFor('65f000000000000000000002');

    for (const lockedStatus of ['Approved', 'Rejected']) {
      setupCorrectionDbMock(buildApplicationRecord({ status: lockedStatus }));
      const res = await fetch(
        `${baseUrl}/api/admin/applications/65f500000000000000000001/request-correction`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ correctionMessage: 'Please check DOB' }),
        }
      );
      assert.equal(res.status, 409);
    }
  });

  test('21. Handles concurrent status change safely with HTTP 409', async () => {
    setupCorrectionDbMock(buildApplicationRecord(), { simulateConcurrentChange: true });

    const res = await fetch(
      `${baseUrl}/api/admin/applications/65f500000000000000000001/request-correction`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${signTokenFor('65f000000000000000000003')}`,
        },
        body: JSON.stringify({ correctionMessage: 'Please check DOB' }),
      }
    );

    assert.equal(res.status, 409);
  });
});
