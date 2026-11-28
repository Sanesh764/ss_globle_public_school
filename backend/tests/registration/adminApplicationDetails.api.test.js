import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import StudentApplication, { CLASS_OPTIONS } from '../../src/models/StudentApplication.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_admin_application_details_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
const originalAppFindById = StudentApplication.findById.bind(StudentApplication);
const originalAppCount = StudentApplication.countDocuments.bind(StudentApplication);
const originalAppFind = StudentApplication.find.bind(StudentApplication);
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

const buildSampleApplication = (overrides = {}) => ({
  _id: '65f200000000000000000001',
  applicationNumber: 'SSG-2026-A1B2C3D4E5F60718',
  fullName: 'Aarav Sharma',
  dateOfBirth: new Date('2015-06-15T00:00:00.000Z'),
  gender: 'Male',
  classApplyingFor: 'Class 5',
  photo: {
    url: 'https://res.cloudinary.com/demo/image/upload/v1/ss_global_school/student_applications/stu.jpg',
    public_id: 'ss_global_school/student_applications/stu',
  },
  fatherName: 'Vikram Sharma',
  motherName: 'Priya Sharma',
  contactNumber: '9876543210',
  email: 'parent@example.com',
  status: 'Correction Requested',
  reviewedBy: {
    _id: '65f000000000000000000003',
    name: 'Staff Member',
    email: 'staff@ssglobal.edu.in',
    role: 'staff',
  },
  reviewedAt: new Date('2026-11-28T05:00:00.000Z'),
  reviewNotes: 'Check spelling of father name',
  correctionMessage: 'Please verify father name spelling',
  approvedStudentId: null,
  reviewHistory: [
    {
      action: 'SUBMITTED',
      performedBy: null,
      actorType: 'Applicant',
      note: 'Public registration application submitted',
      changedFields: [],
      timestamp: new Date('2026-11-28T04:00:00.000Z'),
    },
    {
      action: 'CORRECTION_REQUESTED',
      performedBy: {
        _id: '65f000000000000000000003',
        name: 'Staff Member',
        email: 'staff@ssglobal.edu.in',
        role: 'staff',
      },
      actorType: 'Staff',
      note: 'Please verify father name spelling',
      changedFields: ['fatherName'],
      timestamp: new Date('2026-11-28T05:00:00.000Z'),
    },
  ],
  submittedIp: '203.0.113.42',
  __v: 0,
  createdAt: new Date('2026-11-28T04:00:00.000Z'),
  updatedAt: new Date('2026-11-28T05:00:00.000Z'),
  ...overrides,
});

const mockFindByIdWith = (docOrFn) => {
  let capturedProjection = null;
  let populateCalls = [];

  StudentApplication.findById = (id, projection) => {
    capturedProjection = projection;
    const chain = {
      populate(path, select) {
        populateCalls.push({ path, select });
        return chain;
      },
      async lean() {
        if (typeof docOrFn === 'function') {
          return docOrFn(id);
        }
        return docOrFn;
      },
    };
    return chain;
  };

  return {
    getProjection: () => capturedProjection,
    getPopulateCalls: () => populateCalls,
  };
};

describe('GET /api/admin/applications/:id - Individual Application Details API', () => {
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
    StudentApplication.countDocuments = originalAppCount;
    StudentApplication.find = originalAppFind;
  });

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1-3. Allows superadmin, admin, and staff to view application details', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    mockFindByIdWith(buildSampleApplication());

    for (const userId of [
      '65f000000000000000000001',
      '65f000000000000000000002',
      '65f000000000000000000003',
    ]) {
      const res = await fetch(`${baseUrl}/api/admin/applications/65f200000000000000000001`, {
        headers: { Authorization: `Bearer ${signTokenFor(userId)}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.application.applicationNumber, 'SSG-2026-A1B2C3D4E5F60718');
    }
  });

  test('4. Staff can view application details across all 12 classes', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const staffToken = signTokenFor('65f000000000000000000003');

    for (const cls of CLASS_OPTIONS) {
      mockFindByIdWith(buildSampleApplication({ classApplyingFor: cls }));
      const res = await fetch(`${baseUrl}/api/admin/applications/65f200000000000000000001`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.application.classApplyingFor, cls);
    }
  });

  test('5. Unauthenticated request returns HTTP 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/applications/65f200000000000000000001`);
    assert.equal(res.status, 401);
  });

  test('6. Unauthorized role returns HTTP 403', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const res = await fetch(`${baseUrl}/api/admin/applications/65f200000000000000000001`, {
      headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000004')}` },
    });
    assert.equal(res.status, 403);
  });

  test('7. Invalid ObjectId returns HTTP 400', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const res = await fetch(`${baseUrl}/api/admin/applications/not-a-valid-object-id`, {
      headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000003')}` },
    });
    assert.equal(res.status, 400);
  });

  test('8. Nonexistent application returns HTTP 404', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    mockFindByIdWith(null);

    const res = await fetch(`${baseUrl}/api/admin/applications/65f200000000000000000099`, {
      headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000003')}` },
    });
    assert.equal(res.status, 404);
  });

  test('9-10 & 12. Returns all required student, parent, application, and review fields while stripping submittedIp', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const spy = mockFindByIdWith(buildSampleApplication());

    const res = await fetch(`${baseUrl}/api/admin/applications/65f200000000000000000001`, {
      headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000003')}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    const appData = body.data.application;

    assert.equal(appData.fullName, 'Aarav Sharma');
    assert.equal(appData.fatherName, 'Vikram Sharma');
    assert.equal(appData.motherName, 'Priya Sharma');
    assert.equal(appData.contactNumber, '9876543210');
    assert.equal(appData.email, 'parent@example.com');
    assert.equal(appData.status, 'Correction Requested');
    assert.equal(appData.reviewNotes, 'Check spelling of father name');
    assert.equal(appData.correctionMessage, 'Please verify father name spelling');
    assert.equal(appData.reviewHistory.length, 2);
    assert.equal('submittedIp' in appData, false);
    assert.equal('__v' in appData, false);

    // Verify limited Admin populate projection
    assert.deepEqual(spy.getPopulateCalls(), [
      { path: 'reviewedBy', select: 'name email role' },
      { path: 'reviewHistory.performedBy', select: 'name email role' },
    ]);
  });

  test('11. Handles missing optional email and photo gracefully', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    mockFindByIdWith(
      buildSampleApplication({
        email: undefined,
        photo: undefined,
      })
    );

    const res = await fetch(`${baseUrl}/api/admin/applications/65f200000000000000000001`, {
      headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000003')}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.application.email, null);
    assert.deepEqual(body.data.application.photo, { url: '', public_id: '' });
  });

  test('13. Handles unexpected database errors safely with HTTP 500', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    mockFindByIdWith(() => {
      throw new Error('MongoDB connection error');
    });

    const res = await fetch(`${baseUrl}/api/admin/applications/65f200000000000000000001`, {
      headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000003')}` },
    });
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  test('14. Existing GET /api/admin/applications listing endpoint continues working', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    StudentApplication.countDocuments = async () => 1;
    StudentApplication.find = () => ({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            lean: async () => [
              {
                _id: '65f200000000000000000001',
                applicationNumber: 'SSG-2026-A1B2C3D4E5F60718',
                fullName: 'Aarav Sharma',
                classApplyingFor: 'Class 5',
                status: 'Pending',
                createdAt: new Date(),
              },
            ],
          }),
        }),
      }),
    });

    const res = await fetch(`${baseUrl}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000003')}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.applications.length, 1);
  });
});
