import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import Student from '../../src/models/Student.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_admin_student_detail_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
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
    password: 'hashed_secret_should_never_leak',
  },
  '65f000000000000000000002': {
    _id: '65f000000000000000000002',
    name: 'School Admin',
    email: 'admin@ssglobal.edu.in',
    role: 'admin',
    isActive: true,
    password: 'hashed_secret_should_never_leak',
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

describe('GET /api/admin/students/:id - Admin & Staff Student Detail API', () => {
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

  const setupMocks = (studentsMap = { '66f200000000000000000001': buildSampleStudent() }) => {
    let lastPopulateArgs = null;

    Admin.findById = (id) => {
      const doc = MOCK_ADMINS[String(id)] || null;
      const promise = Promise.resolve(doc);
      promise.select = async () => doc;
      return promise;
    };

    Student.findById = (id, projection = null) => {
      const raw = studentsMap[String(id)] || null;
      let populated = false;

      const chain = {
        populate(path, selectFields) {
          lastPopulateArgs = { path, selectFields };
          populated = true;
          return chain;
        },
        async lean() {
          if (!raw) return null;
          const doc = applyProjection(raw, projection);
          if (populated && doc.admittedBy) {
            const adminDoc = MOCK_ADMINS[String(doc.admittedBy)];
            if (adminDoc) {
              doc.admittedBy = {
                _id: adminDoc._id,
                name: adminDoc.name,
                email: adminDoc.email,
                role: adminDoc.role,
              };
            }
          }
          return doc;
        },
      };

      return chain;
    };

    Student.countDocuments = async () => Object.keys(studentsMap).length;
    Student.find = (_filter = {}, projection = null) => {
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
          return Object.values(studentsMap).map((doc) => applyProjection(doc, projection));
        },
      };
      return chain;
    };

    return () => lastPopulateArgs;
  };

  test('1-3 & 8-9. Superadmin, Admin, and Staff can fetch student details with all supported fields', async () => {
    setupMocks();

    for (const userId of [
      '65f000000000000000000001', // superadmin
      '65f000000000000000000002', // admin
      '65f000000000000000000003', // staff
    ]) {
      const token = signTokenFor(userId);
      const res = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.message, 'Student fetched successfully.');

      const { student } = body.data;
      assert.equal(student._id, '66f200000000000000000001');
      assert.equal(student.fullName, 'Aarav Sharma');
      assert.equal(student.gender, 'Male');
      assert.equal(student.fatherName, 'Vikram Sharma');
      assert.equal(student.motherName, 'Priya Sharma');
      assert.equal(student.contactNumber, '9876543210');
      assert.equal(student.email, 'parent@example.com');
      assert.equal(student.className, 'Class 9');
      assert.equal(student.admissionNumber, 'ADM-2026-0001');
      assert.equal(student.applicationNumber, 'SSG-2026-A1B2C3D4E5F60718');
      assert.equal(student.isActive, true);
      assert.ok(student.dateOfBirth);
      assert.ok(student.admittedAt);
      assert.ok(student.createdAt);
      assert.ok(student.updatedAt);
    }
  });

  test('4-5. Rejects unauthenticated requests (401) and unauthorized roles (403)', async () => {
    setupMocks();

    const unauthRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`);
    assert.equal(unauthRes.status, 401);

    const forbiddenToken = signTokenFor('65f000000000000000000004');
    const forbiddenRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      headers: { Authorization: `Bearer ${forbiddenToken}` },
    });
    assert.equal(forbiddenRes.status, 403);
  });

  test('6-7. Returns 400 for invalid ObjectId and 404 for nonexistent valid ObjectId', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const invalidIdRes = await fetch(`${baseUrl}/api/admin/students/not-an-object-id`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(invalidIdRes.status, 400);

    const notFoundRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000009999`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notFoundBody = await notFoundRes.json();
    assert.equal(notFoundRes.status, 404);
    assert.match(notFoundBody.message, /not found/i);
  });

  test('10-12. Safely handles missing email, missing photo, and missing admissionNumber', async () => {
    const minimalStudent = buildSampleStudent({
      email: undefined,
      photo: undefined,
      admissionNumber: undefined,
    });
    setupMocks({ '66f200000000000000000001': minimalStudent });
    const token = signTokenFor('65f000000000000000000002');

    const res = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.data.student.email, null);
    assert.deepEqual(body.data.student.photo, { url: '' });
    assert.equal(body.data.student.admissionNumber, null);
  });

  test('13-15. Populates admittedBy with permitted fields only, hides photo.public_id, and excludes StudentApplication', async () => {
    const getLastPopulate = setupMocks();
    const token = signTokenFor('65f000000000000000000003');

    const res = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.deepEqual(getLastPopulate(), {
      path: 'admittedBy',
      selectFields: 'name email role',
    });

    const { student } = body.data;
    assert.deepEqual(student.admittedBy, {
      name: 'School Admin',
      email: 'admin@ssglobal.edu.in',
      role: 'admin',
    });
    assert.equal(student.admittedBy.password, undefined);
    assert.equal(student.photo.public_id, undefined);
    assert.equal(student.sourceApplicationId, undefined);
    assert.equal(student.reviewHistory, undefined);
  });

  test('16. Existing student listing endpoint continues to work alongside detail route', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const res = await fetch(`${baseUrl}/api/admin/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.data.students.length, 1);
  });
});
