import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import Student from '../../src/models/Student.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_admin_student_update_2026';

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

describe('PATCH /api/admin/students/:id - Admin & Staff Student Update API', () => {
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
    let lastUpdateCall = null;

    Admin.findById = (id) => {
      const doc = MOCK_ADMINS[String(id)] || null;
      const promise = Promise.resolve(doc);
      promise.select = async () => doc;
      return promise;
    };

    Student.findByIdAndUpdate = (id, updateOp = {}, options = {}) => {
      lastUpdateCall = { id, updateOp, options };
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
          if (updateOp.$unset) {
            for (const key of Object.keys(updateOp.$unset)) {
              delete updated[key];
            }
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
          return applyProjection(doc, projection);
        },
      };
      return chain;
    };

    Student.countDocuments = async () => Object.keys(store).length;
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
          return Object.values(store).map((doc) => applyProjection(doc, projection));
        },
      };
      return chain;
    };

    return () => lastUpdateCall;
  };

  test('1-3 & 8-9. Superadmin, Admin, and Staff can perform valid partial and fullName updates', async () => {
    for (const [idx, userId] of [
      '65f000000000000000000001',
      '65f000000000000000000002',
      '65f000000000000000000003',
    ].entries()) {
      const getLastUpdate = setupMocks();
      const token = signTokenFor(userId);
      const nextName = `Aarav Updated ${idx + 1}`;

      const res = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName: `  ${nextName}  ` }),
      });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.message, 'Student updated successfully.');
      assert.equal(body.data.student.fullName, nextName);
      assert.equal(body.data.student.photo.public_id, undefined);
      assert.equal(getLastUpdate().options.runValidators, true);
      assert.equal(getLastUpdate().options.new, true);
    }
  });

  test('4-5. Rejects unauthenticated requests (401) and unauthorized roles (403)', async () => {
    setupMocks();

    const unauthRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Updated Name' }),
    });
    assert.equal(unauthRes.status, 401);

    const forbiddenToken = signTokenFor('65f000000000000000000004');
    const forbiddenRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${forbiddenToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName: 'Updated Name' }),
    });
    assert.equal(forbiddenRes.status, 403);
  });

  test('6-7. Returns 400 for invalid ObjectId and 404 when Student does not exist', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const badIdRes = await fetch(`${baseUrl}/api/admin/students/bad-id`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName: 'Valid Name' }),
    });
    assert.equal(badIdRes.status, 400);

    const notFoundRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000009999`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName: 'Valid Name' }),
    });
    assert.equal(notFoundRes.status, 404);
  });

  test('10-11. Validates dateOfBirth and rejects future dates', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000002');

    const validRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dateOfBirth: '2012-08-15' }),
    });
    assert.equal(validRes.status, 200);

    const invalidDateRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dateOfBirth: 'not-a-date' }),
    });
    assert.equal(invalidDateRes.status, 400);

    const futureDateRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dateOfBirth: '2099-01-01' }),
    });
    assert.equal(futureDateRes.status, 400);
  });

  test('12-15. Rejects invalid gender, className, contactNumber, and normalizes +91 contactNumber', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000003');

    for (const badPayload of [
      { gender: 'Unknown' },
      { className: 'Class 13' },
      { contactNumber: '12345' },
      { contactNumber: '5123456789' },
    ]) {
      const badRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(badPayload),
      });
      assert.equal(badRes.status, 400);
    }

    const normRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contactNumber: '+91 98765-43219' }),
    });
    const normBody = await normRes.json();
    assert.equal(normRes.status, 200);
    assert.equal(normBody.data.student.contactNumber, '9876543219');
  });

  test('16-17. Normalizes email preserving Gmail dots/+ tags, rejects invalid email, and clears optional email via $unset', async () => {
    const getLastUpdate = setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const badEmailRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'not-an-email' }),
    });
    assert.equal(badEmailRes.status, 400);

    const gmailRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: '  Sanesh.Gupta+Tag@Gmail.COM  ' }),
    });
    const gmailBody = await gmailRes.json();
    assert.equal(gmailRes.status, 200);
    assert.equal(gmailBody.data.student.email, 'sanesh.gupta+tag@gmail.com');

    const clearRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: '   ' }),
    });
    const clearBody = await clearRes.json();
    assert.equal(clearRes.status, 200);
    assert.equal(clearBody.data.student.email, null);
    assert.deepEqual(getLastUpdate().updateOp.$unset, { email: 1 });
  });

  test('18-20. Rejects empty payload, unknown fields, and protected/immutable fields with 400', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000002');

    const emptyRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    assert.equal(emptyRes.status, 400);

    const protectedPayloads = [
      { unknownField: 'abc' },
      { _id: '66f200000000000000000099' },
      { sourceApplicationId: '65f200000000000000000099' },
      { applicationNumber: 'SSG-2026-HACK' },
      { admittedBy: '65f000000000000000000001' },
      { admittedAt: '2026-01-01T00:00:00.000Z' },
      { isActive: false },
      { photo: { url: 'https://evil.test/x.jpg' } },
      { admissionNumber: 'ADM-9999' },
      { fullName: 'Valid Name', isActive: false },
    ];

    for (const payload of protectedPayloads) {
      const res = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      assert.equal(res.status, 400, `Expected 400 for payload ${JSON.stringify(payload)}`);
    }
  });

  test('21-22. Updates multiple editable fields together and preserves listing/detail APIs', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const updateRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Rohan Verma',
        gender: 'Male',
        fatherName: 'Suresh Verma',
        motherName: 'Anita Verma',
        className: 'Class 10',
        contactNumber: '9876543211',
      }),
    });
    const updateBody = await updateRes.json();
    assert.equal(updateRes.status, 200);
    assert.equal(updateBody.data.student.fullName, 'Rohan Verma');
    assert.equal(updateBody.data.student.className, 'Class 10');
    assert.equal(updateBody.data.student.fatherName, 'Suresh Verma');
    assert.equal(updateBody.data.student.motherName, 'Anita Verma');
    assert.equal(updateBody.data.student.contactNumber, '9876543211');

    const listRes = await fetch(`${baseUrl}/api/admin/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(listRes.status, 200);

    const detailRes = await fetch(`${baseUrl}/api/admin/students/66f200000000000000000001`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(detailRes.status, 200);
  });
});
