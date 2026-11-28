import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import Student from '../../src/models/Student.js';
import { CLASS_OPTIONS } from '../../src/models/StudentApplication.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_admin_student_list_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
const originalCountDocuments = Student.countDocuments.bind(Student);
const originalFind = Student.find.bind(Student);
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

// Build 12 realistic permanent Student records across Class 1..12 with sensitive/internal fields present in DB
const SAMPLE_STUDENTS = CLASS_OPTIONS.map((cls, idx) => ({
  _id: `66f1000000000000000000${String(idx + 1).padStart(2, '0')}`,
  fullName: idx === 0 ? 'Aarav (Test) Sharma' : `Admitted Student ${idx + 1}`,
  dateOfBirth: new Date('2015-05-10'),
  gender: idx % 2 === 0 ? 'Male' : 'Female',
  fatherName: `Father ${idx + 1}`,
  motherName: `Mother ${idx + 1}`,
  contactNumber: idx === 2 ? '9876500003' : `98765432${String(idx + 10).padStart(2, '0')}`,
  className: cls,
  email: `parent${idx + 1}@example.com`,
  photo: {
    url: `https://res.cloudinary.com/demo/image/upload/v1/student_${idx + 1}.jpg`,
    public_id: `ss-global/students/student_${idx + 1}`,
  },
  admissionNumber: idx === 0 ? undefined : `ADM-2026-${String(idx + 1).padStart(4, '0')}`,
  sourceApplicationId: `65f1000000000000000000${String(idx + 1).padStart(2, '0')}`,
  applicationNumber: `SSG-2026-00000000000000${String(idx + 1).padStart(2, '0')}`,
  admittedBy: '65f000000000000000000001',
  admittedAt: new Date(Date.UTC(2026, 10, 1 + idx)),
  isActive: idx % 3 !== 0,
  createdAt: new Date(Date.UTC(2026, 10, 1 + idx)),
}));

const matchesFilter = (doc, filter) => {
  if (filter.className && doc.className !== filter.className) return false;
  if (typeof filter.isActive === 'boolean' && doc.isActive !== filter.isActive) return false;
  if (filter.$or) {
    const anyMatch = filter.$or.some((cond) => {
      const [key, regex] = Object.entries(cond)[0];
      return doc[key] !== undefined && doc[key] !== null && regex.test(String(doc[key]));
    });
    if (!anyMatch) return false;
  }
  return true;
};

const applyProjection = (doc, projection) => {
  if (!projection || typeof projection !== 'object') return { ...doc };
  const projected = {};
  for (const [key, include] of Object.entries(projection)) {
    if (!include) continue;
    if (key === 'photo.url') {
      projected.photo = { url: doc.photo?.url || '' };
    } else {
      projected[key] = doc[key];
    }
  }
  return projected;
};

describe('GET /api/admin/students - Admin & Staff Student Listing API', () => {
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
    Student.countDocuments = originalCountDocuments;
    Student.find = originalFind;
  });

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  const setupMocks = (dataset = SAMPLE_STUDENTS) => {
    let lastQueryArgs = null;

    Admin.findById = (id) => {
      const doc = MOCK_ADMINS[String(id)] || null;
      const promise = Promise.resolve(doc);
      promise.select = async () => doc;
      return promise;
    };

    Student.countDocuments = async (filter = {}) => {
      return dataset.filter((doc) => matchesFilter(doc, filter)).length;
    };

    Student.find = (filter = {}, projection = null) => {
      let sortSpec = { admittedAt: -1, _id: -1 };
      let skipVal = 0;
      let limitVal = dataset.length;

      lastQueryArgs = { filter, projection };

      const chain = {
        sort(spec) {
          sortSpec = spec;
          lastQueryArgs.sortSpec = spec;
          return chain;
        },
        skip(val) {
          skipVal = val;
          lastQueryArgs.skipVal = val;
          return chain;
        },
        limit(val) {
          limitVal = val;
          lastQueryArgs.limitVal = val;
          return chain;
        },
        async lean() {
          const filtered = dataset.filter((doc) => matchesFilter(doc, filter));
          const sorted = [...filtered].sort((a, b) => {
            if (sortSpec.admittedAt === -1) {
              const diff = new Date(b.admittedAt) - new Date(a.admittedAt);
              if (diff !== 0) return diff;
            }
            return String(b._id).localeCompare(String(a._id));
          });
          return sorted
            .slice(skipVal, skipVal + limitVal)
            .map((doc) => applyProjection(doc, projection));
        },
      };

      return chain;
    };

    return () => lastQueryArgs;
  };

  test('1-3. Superadmin, Admin, and Staff can all list students with equal access across Classes 1-12', async () => {
    setupMocks();

    for (const userId of [
      '65f000000000000000000001', // superadmin
      '65f000000000000000000002', // admin
      '65f000000000000000000003', // staff
    ]) {
      const token = signTokenFor(userId);
      const res = await fetch(`${baseUrl}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.students.length, 12);
      assert.equal(body.data.pagination.totalRecords, 12);
    }
  });

  test('4. Rejects unauthenticated requests (401) and non-admin/non-staff roles (403)', async () => {
    setupMocks();

    const unauthRes = await fetch(`${baseUrl}/api/admin/students`);
    assert.equal(unauthRes.status, 401);

    const forbiddenToken = signTokenFor('65f000000000000000000004');
    const forbiddenRes = await fetch(`${baseUrl}/api/admin/students`, {
      headers: { Authorization: `Bearer ${forbiddenToken}` },
    });
    assert.equal(forbiddenRes.status, 403);
  });

  test('5-6 & 20. Supports default and custom pagination with accurate metadata', async () => {
    const getLastQuery = setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    // Default pagination
    const defaultRes = await fetch(`${baseUrl}/api/admin/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const defaultBody = await defaultRes.json();
    assert.equal(defaultRes.status, 200);
    assert.deepEqual(defaultBody.data.pagination, {
      totalRecords: 12,
      currentPage: 1,
      pageSize: 15,
      totalPages: 1,
    });
    assert.equal(getLastQuery().skipVal, 0);
    assert.equal(getLastQuery().limitVal, 15);
    assert.deepEqual(getLastQuery().sortSpec, { admittedAt: -1, _id: -1 });

    // Custom pagination
    const customRes = await fetch(`${baseUrl}/api/admin/students?page=2&limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const customBody = await customRes.json();
    assert.equal(customRes.status, 200);
    assert.equal(customBody.data.students.length, 5);
    assert.deepEqual(customBody.data.pagination, {
      totalRecords: 12,
      currentPage: 2,
      pageSize: 5,
      totalPages: 3,
    });
    assert.equal(getLastQuery().skipVal, 5);
    assert.equal(getLastQuery().limitVal, 5);
  });

  test('7. Rejects invalid, zero, negative, or excessive page and limit parameters with 400', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000002');

    for (const query of ['page=0', 'page=-2', 'page=abc', 'limit=0', 'limit=51', 'limit=1.5']) {
      const res = await fetch(`${baseUrl}/api/admin/students?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(res.status, 400, `Expected 400 for query ${query}`);
    }
  });

  test('8-12. Searches by name, contactNumber, admissionNumber, applicationNumber, and escapes regex characters', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000003');

    // Search by student name
    const nameRes = await fetch(`${baseUrl}/api/admin/students?search=Aarav`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const nameBody = await nameRes.json();
    assert.equal(nameRes.status, 200);
    assert.equal(nameBody.data.students.length, 1);
    assert.equal(nameBody.data.students[0].fullName, 'Aarav (Test) Sharma');

    // Search by contact number
    const contactRes = await fetch(`${baseUrl}/api/admin/students?search=9876500003`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const contactBody = await contactRes.json();
    assert.equal(contactRes.status, 200);
    assert.equal(contactBody.data.students.length, 1);
    assert.equal(contactBody.data.students[0].contactNumber, '9876500003');

    // Search by admissionNumber
    const admRes = await fetch(`${baseUrl}/api/admin/students?search=ADM-2026-0005`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const admBody = await admRes.json();
    assert.equal(admRes.status, 200);
    assert.equal(admBody.data.students.length, 1);
    assert.equal(admBody.data.students[0].admissionNumber, 'ADM-2026-0005');

    // Search by applicationNumber
    const appRes = await fetch(
      `${baseUrl}/api/admin/students?search=SSG-2026-0000000000000008`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const appBody = await appRes.json();
    assert.equal(appRes.status, 200);
    assert.equal(appBody.data.students.length, 1);
    assert.equal(appBody.data.students[0].applicationNumber, 'SSG-2026-0000000000000008');

    // Regex special characters escaped safely (literal "(Test)")
    const regexRes = await fetch(
      `${baseUrl}/api/admin/students?search=${encodeURIComponent('(Test)')}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const regexBody = await regexRes.json();
    assert.equal(regexRes.status, 200);
    assert.equal(regexBody.data.students.length, 1);

    // Unbalanced regex meta-characters should not throw 500
    const badRegexRes = await fetch(
      `${baseUrl}/api/admin/students?search=${encodeURIComponent('[invalid(')}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(badRegexRes.status, 200);
  });

  test('13-14. Filters by className for Class 1-12 and rejects invalid classes with 400', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const validRes = await fetch(
      `${baseUrl}/api/admin/students?className=${encodeURIComponent('Class 9')}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const validBody = await validRes.json();
    assert.equal(validRes.status, 200);
    assert.equal(validBody.data.students.length, 1);
    assert.equal(validBody.data.students[0].className, 'Class 9');

    const invalidRes = await fetch(
      `${baseUrl}/api/admin/students?className=${encodeURIComponent('Class 13')}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(invalidRes.status, 400);
  });

  test('15-17. Filters by isActive true/false without truthiness bug and rejects invalid isActive with 400', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000002');

    const activeRes = await fetch(`${baseUrl}/api/admin/students?isActive=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const activeBody = await activeRes.json();
    assert.equal(activeRes.status, 200);
    assert.equal(activeBody.data.students.length, 8);
    assert.ok(activeBody.data.students.every((s) => s.isActive === true));

    const inactiveRes = await fetch(`${baseUrl}/api/admin/students?isActive=false`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const inactiveBody = await inactiveRes.json();
    assert.equal(inactiveRes.status, 200);
    assert.equal(inactiveBody.data.students.length, 4);
    assert.ok(inactiveBody.data.students.every((s) => s.isActive === false));

    for (const invalidVal of ['yes', '1', '0', 'null']) {
      const badRes = await fetch(`${baseUrl}/api/admin/students?isActive=${invalidVal}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(badRes.status, 400, `Expected 400 for isActive=${invalidVal}`);
    }
  });

  test('18-19. Supports combined filters and returns 200 with empty array when no students match', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000003');

    const combinedRes = await fetch(
      `${baseUrl}/api/admin/students?className=${encodeURIComponent('Class 2')}&isActive=true&search=Admitted`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const combinedBody = await combinedRes.json();
    assert.equal(combinedRes.status, 200);
    assert.equal(combinedBody.data.students.length, 1);
    assert.equal(combinedBody.data.students[0].className, 'Class 2');

    setupMocks([]);
    const emptyRes = await fetch(`${baseUrl}/api/admin/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const emptyBody = await emptyRes.json();
    assert.equal(emptyRes.status, 200);
    assert.deepEqual(emptyBody.data.students, []);
    assert.deepEqual(emptyBody.data.pagination, {
      totalRecords: 0,
      currentPage: 1,
      pageSize: 15,
      totalPages: 0,
    });
  });

  test('21-22. Handles optional admissionNumber as null and never exposes photo.public_id or unrelated fields', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const res = await fetch(`${baseUrl}/api/admin/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    assert.equal(res.status, 200);

    const unassignedStudent = body.data.students.find((s) => s.fullName === 'Aarav (Test) Sharma');
    assert.ok(unassignedStudent);
    assert.equal(unassignedStudent.admissionNumber, null);

    for (const student of body.data.students) {
      assert.deepEqual(Object.keys(student).sort(), [
        '_id',
        'admissionNumber',
        'admittedAt',
        'applicationNumber',
        'className',
        'contactNumber',
        'createdAt',
        'fullName',
        'isActive',
        'photo',
      ]);
      assert.equal(student.photo.public_id, undefined);
      assert.equal(student.sourceApplicationId, undefined);
      assert.equal(student.admittedBy, undefined);
      assert.equal(student.fatherName, undefined);
      assert.equal(student.motherName, undefined);
      assert.equal(student.email, undefined);
    }
  });
});
