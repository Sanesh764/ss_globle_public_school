import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import Student from '../../src/models/Student.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_admin_student_status_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
const originalStudentFindByIdAndUpdate = Student.findByIdAndUpdate.bind(Student);
const originalStudentFindById = Student.findById.bind(Student);
const originalStudentCountDocuments = Student.countDocuments.bind(Student);
const originalStudentFind = Student.find.bind(Student);
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

const buildSampleStudent = (overrides = {}) => ({
  _id: '66f200000000000000000001',
  fullName: 'Aarav Sharma',
  dateOfBirth: new Date('2013-06-15T00:00:00.000Z'),
  gender: 'Male',
  fatherName: 'Vikram Sharma',
  motherName: 'Priya Sharma',
  contactNumber: '9876543210',
  email: 'parent@example.com',
  className: 'Class 9',
  photo: {
    url: 'https://res.cloudinary.com/demo/image/upload/v1/ss-global/students/aarav.jpg',
    public_id: 'ss-global/students/aarav',
  },
  admissionNumber: 'ADM-2026-0001',
  sourceApplicationId: '65f200000000000000000001',
  applicationNumber: 'SSG-2026-A1B2C3D4E5F60718',
  admittedBy: '65f000000000000000000002',
  admittedAt: new Date('2026-11-10T10:30:00.000Z'),
  isActive: true,
  createdAt: new Date('2026-11-10T10:30:00.000Z'),
  updatedAt: new Date('2026-11-12T12:00:00.000Z'),
  ...overrides,
});

const applyProjection = (doc, projection) => {
  if (!projection || typeof projection !== 'object') return { ...doc };
  const projected = {};
  for (const [key, include] of Object.entries(projection)) {
    if (!include) continue;
    if (key === 'photo.url') {
      projected.photo = doc.photo ? { url: doc.photo.url || '' } : undefined;
    } else {
      projected[key] = doc[key];
    }
  }
  return projected;
};

describe('PATCH /api/admin/students/:id/status - Admin & Staff Student Activate/Deactivate API', () => {
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
    Student.findByIdAndUpdate = originalStudentFindByIdAndUpdate;
    Student.findById = originalStudentFindById;
    Student.countDocuments = originalStudentCountDocuments;
    Student.find = originalStudentFind;
  });

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  const setupMocks = (initialStudent = buildSampleStudent()) => {
    const store = initialStudent ? { [String(initialStudent._id)]: { ...initialStudent } } : {};
    let lastUpdateOp = null;

    Admin.findById = (id) => {
      const doc = MOCK_ADMINS[String(id)] || null;
      const promise = Promise.resolve(doc);
      promise.select = async () => doc;
      return promise;
    };

    Student.findByIdAndUpdate = (id, updateOp = {}, options = {}) => {
      lastUpdateOp = updateOp;
      const chain = {
        populate() {
          return chain;
        },
        async lean() {
          const existing = store[String(id)];
          if (!existing) return null;

          const updated = { ...existing };
          if (updateOp.$set) {
            Object.assign(updated, updateOp.$set);
          }
          updated.updatedAt = new Date();
          store[String(id)] = updated;

          const projected = applyProjection(updated, options.projection);
          const adminDoc = MOCK_ADMINS[String(updated.admittedBy)];
          if (adminDoc) {
            projected.admittedBy = {
              name: adminDoc.name,
              email: adminDoc.email,
              role: adminDoc.role,
            };
          }
          return projected;
        },
      };
      return chain;
    };

    Student.findById = (id, projection = null) => {
      const chain = {
        populate() {
          return chain;
        },
        async lean() {
          const doc = store[String(id)];
          if (!doc) return null;
          const projected = applyProjection(doc, projection);
          const adminDoc = MOCK_ADMINS[String(doc.admittedBy)];
          if (adminDoc) {
            projected.admittedBy = {
              name: adminDoc.name,
              email: adminDoc.email,
              role: adminDoc.role,
            };
          }
          return projected;
        },
      };
      return chain;
    };

    const matchesFilter = (doc, filter) => {
      if (filter.className && doc.className !== filter.className) return false;
      if (typeof filter.isActive === 'boolean' && doc.isActive !== filter.isActive) return false;
      return true;
    };

    Student.countDocuments = async (filter = {}) =>
      Object.values(store).filter((doc) => matchesFilter(doc, filter)).length;

    Student.find = (filter = {}, projection = null) => {
      const chain = {
        sort() {
          return chain;
        },
        skip() {
          return chain;
        },
        limit() {
          return chain;
        },
        async lean() {
          return Object.values(store)
            .filter((doc) => matchesFilter(doc, filter))
            .map((doc) => applyProjection(doc, projection));
        },
      };
      return chain;
    };

    return { store, getLastUpdateOp: () => lastUpdateOp };
  };

  test('1-4 & 15-16. Superadmin, Admin, and Staff can deactivate and reactivate a Student while preserving identity', async () => {
    const { store, getLastUpdateOp } = setupMocks();

    for (const userId of [
      '65f000000000000000000001', // superadmin
      '65f000000000000000000002', // admin
      '65f000000000000000000003', // staff
    ]) {
      const token = signTokenFor(userId);

      // Deactivate
      const deactRes = await fetch(
        `${baseUrl}/api/admin/students/66f200000000000000000001/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: false }),
        }
      );
      const deactBody = await deactRes.json();
      assert.equal(deactRes.status, 200);
      assert.equal(deactBody.success, true);
      assert.equal(deactBody.message, 'Student status updated successfully.');
      assert.equal(deactBody.data.student.isActive, false);
      assert.equal(deactBody.data.student._id, '66f200000000000000000001');
      assert.deepEqual(getLastUpdateOp(), { $set: { isActive: false } });
      assert.equal(
        store['66f200000000000000000001'].sourceApplicationId,
        '65f200000000000000000001'
      );

      // Reactivate
      const reactRes = await fetch(
        `${baseUrl}/api/admin/students/66f200000000000000000001/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: true }),
        }
      );
      const reactBody = await reactRes.json();
      assert.equal(reactRes.status, 200);
      assert.equal(reactBody.data.student.isActive, true);
      assert.equal(reactBody.data.student._id, '66f200000000000000000001');
      assert.deepEqual(getLastUpdateOp(), { $set: { isActive: true } });
    }
  });

  test('5-6. Rejects unauthenticated requests (401) and unauthorized roles (403)', async () => {
    setupMocks();

    const unauthRes = await fetch(
      `${baseUrl}/api/admin/students/66f200000000000000000001/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      }
    );
    assert.equal(unauthRes.status, 401);

    const forbiddenToken = signTokenFor('65f000000000000000000004');
    const forbiddenRes = await fetch(
      `${baseUrl}/api/admin/students/66f200000000000000000001/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${forbiddenToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      }
    );
    assert.equal(forbiddenRes.status, 403);
  });

  test('7-8. Returns 400 for invalid ObjectId and 404 for nonexistent Student', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const badIdRes = await fetch(`${baseUrl}/api/admin/students/not-valid-id/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: false }),
    });
    assert.equal(badIdRes.status, 400);

    const notFoundRes = await fetch(
      `${baseUrl}/api/admin/students/66f200000000000000009999/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      }
    );
    assert.equal(notFoundRes.status, 404);
  });

  test('9-14. Rejects missing isActive, string booleans, numbers, null, and extra fields with 400', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000002');

    const invalidBodies = [
      {},
      { isActive: 'true' },
      { isActive: 'false' },
      { isActive: 1 },
      { isActive: 0 },
      { isActive: null },
      { isActive: false, fullName: 'Tampered' },
      { otherField: true },
    ];

    for (const payload of invalidBodies) {
      const res = await fetch(
        `${baseUrl}/api/admin/students/66f200000000000000000001/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      assert.equal(res.status, 400, `Expected 400 for payload ${JSON.stringify(payload)}`);
    }
  });

  test('17-21. Listing, detail, and update endpoints reflect status changes and remain unaffected', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000003');

    // Deactivate student
    const deactRes = await fetch(
      `${baseUrl}/api/admin/students/66f200000000000000000001/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      }
    );
    assert.equal(deactRes.status, 200);

    // Listing without isActive shows inactive student
    const allListRes = await fetch(`${baseUrl}/api/admin/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allListBody = await allListRes.json();
    assert.equal(allListRes.status, 200);
    assert.equal(allListBody.data.students.length, 1);
    assert.equal(allListBody.data.students[0].isActive, false);

    // isActive=false returns inactive student
    const inactiveListRes = await fetch(`${baseUrl}/api/admin/students?isActive=false`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const inactiveListBody = await inactiveListRes.json();
    assert.equal(inactiveListRes.status, 200);
    assert.equal(inactiveListBody.data.students.length, 1);

    // isActive=true excludes inactive student (attendance compatibility)
    const activeListRes = await fetch(
      `${baseUrl}/api/admin/students?className=${encodeURIComponent('Class 9')}&isActive=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const activeListBody = await activeListRes.json();
    assert.equal(activeListRes.status, 200);
    assert.equal(activeListBody.data.students.length, 0);

    // Detail shows updated status
    const detailRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const detailBody = await detailRes.json();
    assert.equal(detailRes.status, 200);
    assert.equal(detailBody.data.student.isActive, false);

    // Update endpoint remains unaffected
    const updateRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName: 'Aarav Sharma Updated' }),
    });
    const updateBody = await updateRes.json();
    assert.equal(updateRes.status, 200);
    assert.equal(updateBody.data.student.fullName, 'Aarav Sharma Updated');
  });
});
