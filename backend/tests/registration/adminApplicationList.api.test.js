import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import StudentApplication, { CLASS_OPTIONS } from '../../src/models/StudentApplication.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_admin_application_list_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
const originalCountDocuments = StudentApplication.countDocuments.bind(StudentApplication);
const originalFind = StudentApplication.find.bind(StudentApplication);
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

// Build 12 realistic applications across Class 1 through Class 12 with sensitive fields present in DB
const SAMPLE_APPLICATIONS = CLASS_OPTIONS.map((cls, idx) => ({
  _id: `65f1000000000000000000${String(idx + 1).padStart(2, '0')}`,
  applicationNumber: `SSG-2026-00000000000000${String(idx + 1).padStart(2, '0')}`,
  fullName: idx === 0 ? 'Aarav Sharma' : `Student ${idx + 1}`,
  dateOfBirth: new Date('2015-05-10'),
  gender: idx % 2 === 0 ? 'Male' : 'Female',
  fatherName: `Father ${idx + 1}`,
  motherName: `Mother ${idx + 1}`,
  contactNumber: idx === 2 ? '9876500003' : `98765432${String(idx + 10).padStart(2, '0')}`,
  classApplyingFor: cls,
  email: `parent${idx + 1}@example.com`,
  status: ['Pending', 'Correction Requested', 'Approved', 'Rejected'][idx % 4],
  reviewNotes: 'Internal review note',
  reviewHistory: [{ action: 'SUBMITTED', actorType: 'Applicant' }],
  createdAt: new Date(Date.UTC(2026, 10, 1 + idx)),
}));

const matchesFilter = (doc, filter) => {
  if (filter.status && doc.status !== filter.status) return false;
  if (filter.classApplyingFor && doc.classApplyingFor !== filter.classApplyingFor) return false;
  if (filter.$or) {
    const anyMatch = filter.$or.some((cond) => {
      const [key, regex] = Object.entries(cond)[0];
      return regex.test(String(doc[key] || ''));
    });
    if (!anyMatch) return false;
  }
  return true;
};

const applyProjection = (doc, projection) => {
  if (!projection || typeof projection !== 'object') return { ...doc };
  const projected = {};
  for (const [key, include] of Object.entries(projection)) {
    if (include) projected[key] = doc[key];
  }
  return projected;
};

describe('GET /api/admin/applications - Admin & Staff Application Listing API', () => {
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
    StudentApplication.countDocuments = originalCountDocuments;
    StudentApplication.find = originalFind;
  });

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  const setupMocks = (dataset = SAMPLE_APPLICATIONS) => {
    let lastQueryArgs = null;

    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;

    StudentApplication.countDocuments = async (filter = {}) =>
      dataset.filter((doc) => matchesFilter(doc, filter)).length;

    StudentApplication.find = (filter = {}, projection = null) => {
      lastQueryArgs = { filter, projection, sort: null, skip: 0, limit: 15 };
      const chain = {
        sort(sortObj) {
          lastQueryArgs.sort = sortObj;
          return chain;
        },
        skip(n) {
          lastQueryArgs.skip = n;
          return chain;
        },
        limit(n) {
          lastQueryArgs.limit = n;
          return chain;
        },
        async lean() {
          let rows = dataset.filter((doc) => matchesFilter(doc, filter));
          if (lastQueryArgs.sort?.createdAt === -1) {
            rows = [...rows].sort((a, b) => b.createdAt - a.createdAt);
          }
          rows = rows.slice(lastQueryArgs.skip, lastQueryArgs.skip + lastQueryArgs.limit);
          return rows.map((doc) => applyProjection(doc, projection));
        },
      };
      return chain;
    };

    return () => lastQueryArgs;
  };

  test('1-3 & 18. Allows superadmin, admin, and staff access to applications across all 12 classes', async () => {
    setupMocks();

    for (const userId of [
      '65f000000000000000000001', // superadmin
      '65f000000000000000000002', // admin
      '65f000000000000000000003', // staff
    ]) {
      const res = await fetch(`${baseUrl}/api/admin/applications`, {
        headers: { Authorization: `Bearer ${signTokenFor(userId)}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.applications.length, 12);
      const returnedClasses = new Set(body.data.applications.map((a) => a.classApplyingFor));
      assert.equal(returnedClasses.size, 12);
    }
  });

  test('4. Rejects unauthenticated requests with HTTP 401', async () => {
    setupMocks();
    const res = await fetch(`${baseUrl}/api/admin/applications`);
    assert.equal(res.status, 401);
  });

  test('5. Rejects unauthorized role with HTTP 403', async () => {
    setupMocks();
    const res = await fetch(`${baseUrl}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000004')}` },
    });
    assert.equal(res.status, 403);
  });

  test('6-8. Supports default page/limit, custom pagination, newest-first sorting, and rejects >50 limit', async () => {
    const getLastArgs = setupMocks();
    const token = signTokenFor('65f000000000000000000003');

    const defaultRes = await fetch(`${baseUrl}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(defaultRes.status, 200);
    const defaultBody = await defaultRes.json();
    assert.deepEqual(defaultBody.data.pagination, {
      totalRecords: 12,
      currentPage: 1,
      pageSize: 15,
      totalPages: 1,
    });
    assert.deepEqual(getLastArgs().sort, { createdAt: -1 });
    assert.equal(defaultBody.data.applications[0].classApplyingFor, 'Class 12'); // newest first

    const pagedRes = await fetch(`${baseUrl}/api/admin/applications?page=2&limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(pagedRes.status, 200);
    const pagedBody = await pagedRes.json();
    assert.equal(pagedBody.data.applications.length, 5);
    assert.deepEqual(pagedBody.data.pagination, {
      totalRecords: 12,
      currentPage: 2,
      pageSize: 5,
      totalPages: 3,
    });

    const overMaxRes = await fetch(`${baseUrl}/api/admin/applications?limit=51`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(overMaxRes.status, 400);
  });

  test('9-11. Searches safely by applicationNumber, fullName, and contactNumber (including regex special chars)', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000003');

    const byAppNum = await fetch(`${baseUrl}/api/admin/applications?search=SSG-2026-0000000000000005`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(byAppNum.status, 200);
    const byAppNumBody = await byAppNum.json();
    assert.equal(byAppNumBody.data.applications.length, 1);
    assert.equal(byAppNumBody.data.applications[0].classApplyingFor, 'Class 5');

    const byName = await fetch(`${baseUrl}/api/admin/applications?search=aarav`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(byName.status, 200);
    assert.equal((await byName.json()).data.applications.length, 1);

    const byPhone = await fetch(`${baseUrl}/api/admin/applications?search=9876500003`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(byPhone.status, 200);
    const byPhoneBody = await byPhone.json();
    assert.equal(byPhoneBody.data.applications.length, 1);
    assert.equal(byPhoneBody.data.applications[0].classApplyingFor, 'Class 3');

    // Regex metacharacters must be escaped safely (no SyntaxError / ReDoS)
    const regexCharsRes = await fetch(`${baseUrl}/api/admin/applications?search=.*+?^$()`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(regexCharsRes.status, 200);
    assert.equal((await regexCharsRes.json()).data.applications.length, 0);
  });

  test('12-13. Filters by status and classApplyingFor', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000002');

    const byStatus = await fetch(`${baseUrl}/api/admin/applications?status=Pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(byStatus.status, 200);
    const statusBody = await byStatus.json();
    assert.equal(statusBody.data.applications.length, 3);
    assert.ok(statusBody.data.applications.every((a) => a.status === 'Pending'));

    const byClass = await fetch(`${baseUrl}/api/admin/applications?classApplyingFor=Class%2010`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(byClass.status, 200);
    const classBody = await byClass.json();
    assert.equal(classBody.data.applications.length, 1);
    assert.equal(classBody.data.applications[0].classApplyingFor, 'Class 10');
  });

  test('14-16. Rejects invalid status, invalid classApplyingFor, and invalid pagination values with HTTP 400', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const badQueries = [
      'status=Waitlisted',
      'classApplyingFor=Class%2013',
      'page=0',
      'page=-2',
      'page=abc',
      'page=1.5',
      'limit=0',
      'limit=-1',
      'limit=xyz',
    ];

    for (const qs of badQueries) {
      const res = await fetch(`${baseUrl}/api/admin/applications?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(res.status, 400, `Expected 400 for query "${qs}"`);
    }
  });

  test('17. Returns empty array and clean pagination when no records match', async () => {
    setupMocks([]);
    const token = signTokenFor('65f000000000000000000003');

    const res = await fetch(`${baseUrl}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body.data.applications, []);
    assert.deepEqual(body.data.pagination, {
      totalRecords: 0,
      currentPage: 1,
      pageSize: 15,
      totalPages: 1,
    });
  });

  test('19. Exposes only summary fields and excludes sensitive fields in list responses', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000003');

    const res = await fetch(`${baseUrl}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();

    const item = body.data.applications[0];
    assert.deepEqual(
      Object.keys(item).sort(),
      ['_id', 'applicationNumber', 'classApplyingFor', 'createdAt', 'fullName', 'status']
    );
    assert.equal('fatherName' in item, false);
    assert.equal('motherName' in item, false);
    assert.equal('dateOfBirth' in item, false);
    assert.equal('contactNumber' in item, false);
    assert.equal('email' in item, false);
    assert.equal('reviewHistory' in item, false);
    assert.equal('reviewNotes' in item, false);
  });
});
