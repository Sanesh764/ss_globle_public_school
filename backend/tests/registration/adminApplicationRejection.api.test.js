import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import StudentApplication, { CLASS_OPTIONS } from '../../src/models/StudentApplication.js';
import Student from '../../src/models/Student.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_admin_application_rejection_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
const originalAppFindById = StudentApplication.findById.bind(StudentApplication);
const originalAppFindOneAndUpdate = StudentApplication.findOneAndUpdate.bind(StudentApplication);
const originalStudentCreate = Student.create.bind(Student);
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
  _id: '65f600000000000000000001',
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
  reviewNotes: '',
  correctionMessage: 'Earlier correction note',
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

const setupRejectionDbMock = (initialApp = buildApplicationRecord(), options = {}) => {
  const store = initialApp ? structuredClone(initialApp) : null;
  let studentCreateCalled = false;

  Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;

  Student.create = async () => {
    studentCreateCalled = true;
    throw new Error('Student.create must not be called on rejection');
  };

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

  return {
    getStore: () => store,
    wasStudentCreateCalled: () => studentCreateCalled,
  };
};

describe('PATCH /api/admin/applications/:id/reject - Application Rejection API', () => {
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
    Student.create = originalStudentCreate;
  });

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1-3 & 19-21. Superadmin, Admin, and Staff can reject and record reviewNotes and reviewHistory', async () => {
    const roles = [
      { userId: '65f000000000000000000001', expectedActor: 'Admin' },
      { userId: '65f000000000000000000002', expectedActor: 'Admin' },
      { userId: '65f000000000000000000003', expectedActor: 'Staff' },
    ];

    for (const { userId, expectedActor } of roles) {
      const ctx = setupRejectionDbMock();
      const res = await fetch(
        `${baseUrl}/api/admin/applications/65f600000000000000000001/reject`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${signTokenFor(userId)}`,
          },
          body: JSON.stringify({ rejectionReason: '  Incomplete age eligibility documentation.  ' }),
        }
      );

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.application.status, 'Rejected');
      assert.equal(body.data.application.reviewNotes, 'Incomplete age eligibility documentation.');
      assert.equal(String(body.data.application.reviewedBy), userId);
      assert.ok(body.data.application.reviewedAt);
      assert.equal(ctx.wasStudentCreateCalled(), false);

      const store = ctx.getStore();
      const lastHistory = store.reviewHistory.at(-1);
      assert.equal(lastHistory.action, 'REJECTED');
      assert.equal(lastHistory.actorType, expectedActor);
      assert.equal(String(lastHistory.performedBy), userId);
      assert.equal(lastHistory.note, 'Incomplete age eligibility documentation.');
      assert.deepEqual(lastHistory.changedFields, ['status', 'reviewNotes']);
    }
  });

  test('4. Staff can reject applications across all 12 classes', async () => {
    const staffToken = signTokenFor('65f000000000000000000003');
    for (const cls of CLASS_OPTIONS) {
      setupRejectionDbMock(buildApplicationRecord({ classApplyingFor: cls }));
      const res = await fetch(
        `${baseUrl}/api/admin/applications/65f600000000000000000001/reject`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${staffToken}`,
          },
          body: JSON.stringify({ rejectionReason: `Seats full for ${cls}` }),
        }
      );
      assert.equal(res.status, 200);
    }
  });

  test('5-6. Rejects unauthenticated requests (401) and unauthorized roles (403)', async () => {
    setupRejectionDbMock();

    const unauthRes = await fetch(
      `${baseUrl}/api/admin/applications/65f600000000000000000001/reject`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: 'Valid reason' }),
      }
    );
    assert.equal(unauthRes.status, 401);

    const forbiddenRes = await fetch(
      `${baseUrl}/api/admin/applications/65f600000000000000000001/reject`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${signTokenFor('65f000000000000000000004')}`,
        },
        body: JSON.stringify({ rejectionReason: 'Valid reason' }),
      }
    );
    assert.equal(forbiddenRes.status, 403);
  });

  test('7-8. Invalid ObjectId returns 400 and nonexistent application returns 404', async () => {
    const staffToken = signTokenFor('65f000000000000000000003');
    setupRejectionDbMock();

    const badIdRes = await fetch(
      `${baseUrl}/api/admin/applications/invalid-id/reject`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({ rejectionReason: 'Valid reason' }),
      }
    );
    assert.equal(badIdRes.status, 400);

    setupRejectionDbMock(null);
    const missingRes = await fetch(
      `${baseUrl}/api/admin/applications/65f600000000000000000099/reject`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({ rejectionReason: 'Valid reason' }),
      }
    );
    assert.equal(missingRes.status, 404);
  });

  test('9-13 & 18. Rejects missing, empty, whitespace-only, <5 char, >500 char reasons and unknown fields with 400', async () => {
    const staffToken = signTokenFor('65f000000000000000000003');
    setupRejectionDbMock();

    const invalidPayloads = [
      {},
      { rejectionReason: '' },
      { rejectionReason: '    ' },
      { rejectionReason: 'abcd' },
      { rejectionReason: 'A'.repeat(501) },
      { rejectionReason: 12345 },
      { rejectionReason: 'Valid reason', status: 'Rejected' },
      { rejectionReason: 'Valid reason', reviewedBy: '65f000000000000000000001' },
      { rejectionReason: 'Valid reason', reviewedAt: new Date().toISOString() },
      { rejectionReason: 'Valid reason', reviewHistory: [] },
    ];

    for (const payload of invalidPayloads) {
      const res = await fetch(
        `${baseUrl}/api/admin/applications/65f600000000000000000001/reject`,
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

  test('14-15 & 22-25. Rejects Pending and Correction Requested while preserving student/parent details, photo, and creating no Student', async () => {
    const adminToken = signTokenFor('65f000000000000000000002');

    for (const startStatus of ['Pending', 'Correction Requested']) {
      const ctx = setupRejectionDbMock(buildApplicationRecord({ status: startStatus }));
      const res = await fetch(
        `${baseUrl}/api/admin/applications/65f600000000000000000001/reject`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ rejectionReason: 'Duplicate application submitted' }),
        }
      );

      assert.equal(res.status, 200);
      assert.equal(ctx.wasStudentCreateCalled(), false);
      const store = ctx.getStore();
      assert.equal(store.status, 'Rejected');
      assert.equal(store.fullName, 'Aarav Sharma');
      assert.equal(store.fatherName, 'Vikram Sharma');
      assert.equal(store.motherName, 'Priya Sharma');
      assert.equal(store.correctionMessage, 'Earlier correction note');
      assert.equal(
        store.photo.url,
        'https://res.cloudinary.com/demo/image/upload/v1/ss_global_school/student_applications/stu.jpg'
      );
    }
  });

  test('16-17. Rejects rejecting already Approved or Rejected applications with HTTP 409', async () => {
    const adminToken = signTokenFor('65f000000000000000000002');

    for (const lockedStatus of ['Approved', 'Rejected']) {
      setupRejectionDbMock(buildApplicationRecord({ status: lockedStatus }));
      const res = await fetch(
        `${baseUrl}/api/admin/applications/65f600000000000000000001/reject`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ rejectionReason: 'Attempted late rejection' }),
        }
      );
      assert.equal(res.status, 409);
    }
  });

  test('24. Concurrent approval/rejection is handled safely with HTTP 409', async () => {
    setupRejectionDbMock(buildApplicationRecord(), { simulateConcurrentChange: true });

    const res = await fetch(
      `${baseUrl}/api/admin/applications/65f600000000000000000001/reject`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${signTokenFor('65f000000000000000000003')}`,
        },
        body: JSON.stringify({ rejectionReason: 'Valid rejection reason' }),
      }
    );

    assert.equal(res.status, 409);
  });
});
