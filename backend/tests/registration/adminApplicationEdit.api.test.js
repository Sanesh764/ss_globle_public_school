import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import StudentApplication, { CLASS_OPTIONS } from '../../src/models/StudentApplication.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_admin_application_edit_2026';

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

const createMockApplicationDoc = (overrides = {}) => {
  const doc = new StudentApplication({
    _id: '65f300000000000000000001',
    applicationNumber: 'SSG-2026-A1B2C3D4E5F60718',
    fullName: 'Aarav Sharma',
    dateOfBirth: new Date('2015-06-15T00:00:00.000Z'),
    gender: 'Male',
    fatherName: 'Vikram Sharma',
    motherName: 'Priya Sharma',
    contactNumber: '9876543210',
    classApplyingFor: 'Class 5',
    email: 'parent@example.com',
    status: 'Pending',
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

  doc.saveCalls = 0;
  // Mock save() to run real Mongoose validation without hitting MongoDB Atlas
  doc.save = async function () {
    await this.validate();
    doc.saveCalls += 1;
    return this;
  };

  return doc;
};

describe('PATCH /api/admin/applications/:id - Admin & Staff Application Editing API', () => {
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

  test('1-3. Allows superadmin, admin, and staff to edit application details and records accurate actorType', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;

    const roles = [
      { userId: '65f000000000000000000001', expectedActor: 'Admin' },
      { userId: '65f000000000000000000002', expectedActor: 'Admin' },
      { userId: '65f000000000000000000003', expectedActor: 'Staff' },
    ];

    for (const { userId, expectedActor } of roles) {
      const doc = createMockApplicationDoc();
      StudentApplication.findById = async () => doc;

      const res = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${signTokenFor(userId)}`,
        },
        body: JSON.stringify({ fullName: '  Aarav Verma  ', note: 'Corrected surname' }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.application.fullName, 'Aarav Verma');
      assert.equal(doc.saveCalls, 1);

      const lastHistory = body.data.application.reviewHistory.at(-1);
      assert.equal(lastHistory.action, 'UPDATED');
      assert.equal(lastHistory.actorType, expectedActor);
      assert.equal(lastHistory.note, 'Corrected surname');
      assert.deepEqual(lastHistory.changedFields, ['fullName']);
    }
  });

  test('4. Staff can edit applications across all 12 classes', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const staffToken = signTokenFor('65f000000000000000000003');

    for (const cls of CLASS_OPTIONS) {
      const doc = createMockApplicationDoc({ classApplyingFor: cls });
      StudentApplication.findById = async () => doc;

      const res = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({ fatherName: 'Rajesh Sharma' }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.application.classApplyingFor, cls);
      assert.equal(body.data.application.fatherName, 'Rajesh Sharma');
    }
  });

  test('5. Unauthenticated request returns HTTP 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'New Name' }),
    });
    assert.equal(res.status, 401);
  });

  test('6. Unauthorized role returns HTTP 403', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const res = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${signTokenFor('65f000000000000000000004')}`,
      },
      body: JSON.stringify({ fullName: 'New Name' }),
    });
    assert.equal(res.status, 403);
  });

  test('7. Invalid ObjectId returns HTTP 400', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const res = await fetch(`${baseUrl}/api/admin/applications/invalid-id`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${signTokenFor('65f000000000000000000003')}`,
      },
      body: JSON.stringify({ fullName: 'New Name' }),
    });
    assert.equal(res.status, 400);
  });

  test('8. Nonexistent application returns HTTP 404', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    StudentApplication.findById = async () => null;

    const res = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000099`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${signTokenFor('65f000000000000000000003')}`,
      },
      body: JSON.stringify({ fullName: 'New Name' }),
    });
    assert.equal(res.status, 404);
  });

  test('9-10 & 20. Supports partial and full editable field updates while keeping status unchanged', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const doc = createMockApplicationDoc({ status: 'Correction Requested' });
    StudentApplication.findById = async () => doc;

    const res = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${signTokenFor('65f000000000000000000002')}`,
      },
      body: JSON.stringify({
        fullName: 'Ananya Sharma',
        dateOfBirth: '2014-08-20',
        gender: 'Female',
        fatherName: 'Rakesh Sharma',
        motherName: 'Meena Sharma',
        contactNumber: '+91 98111-22334',
        classApplyingFor: 'Class 6',
        email: '  Sanesh.Gupta+Edit@gmail.com  ',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    const updated = body.data.application;
    assert.equal(updated.fullName, 'Ananya Sharma');
    assert.equal(updated.gender, 'Female');
    assert.equal(updated.fatherName, 'Rakesh Sharma');
    assert.equal(updated.motherName, 'Meena Sharma');
    assert.equal(updated.contactNumber, '9811122334');
    assert.equal(updated.classApplyingFor, 'Class 6');
    assert.equal(updated.email, 'sanesh.gupta+edit@gmail.com');
    assert.equal(updated.status, 'Correction Requested');
    assert.equal(updated.reviewHistory.at(-1).changedFields.length, 8);
  });

  test('11-15. Rejects invalid email, contactNumber, gender, classApplyingFor, and future DOB', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const staffToken = signTokenFor('65f000000000000000000003');
    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const invalidPayloads = [
      { email: 'not-an-email' },
      { contactNumber: '12345' },
      { gender: 'Unknown' },
      { classApplyingFor: 'Class 13' },
      { dateOfBirth: futureDate },
      { fullName: 'A' },
    ];

    for (const payload of invalidPayloads) {
      const doc = createMockApplicationDoc();
      StudentApplication.findById = async () => doc;

      const res = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify(payload),
      });

      assert.equal(res.status, 400, `Expected 400 for payload ${JSON.stringify(payload)}`);
      assert.equal(doc.saveCalls, 0);
    }
  });

  test('16-17. Rejects protected fields and MongoDB operators with HTTP 400', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const staffToken = signTokenFor('65f000000000000000000003');

    const badPayloads = [
      { applicationNumber: 'SSG-2026-CUSTOM1234' },
      { status: 'Approved' },
      { reviewedBy: '65f000000000000000000001' },
      { reviewedAt: new Date().toISOString() },
      { reviewNotes: 'Bypass' },
      { correctionMessage: 'Bypass' },
      { approvedStudentId: '65f000000000000000000099' },
      { reviewHistory: [] },
      { createdAt: new Date().toISOString() },
      { updatedAt: new Date().toISOString() },
      { photo: { url: 'https://evil.com/x.jpg', public_id: 'x' } },
      { $set: { status: 'Approved' } },
      { $unset: { contactNumber: '' } },
      { 'photo.url': 'https://evil.com/x.jpg' },
    ];

    for (const payload of badPayloads) {
      const doc = createMockApplicationDoc();
      StudentApplication.findById = async () => doc;

      const res = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify(payload),
      });

      assert.equal(res.status, 400, `Expected 400 for payload ${JSON.stringify(payload)}`);
      assert.equal(doc.saveCalls, 0);
    }
  });

  test('18-19. Rejects editing of Approved or Rejected applications with HTTP 409', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const adminToken = signTokenFor('65f000000000000000000002');

    for (const lockedStatus of ['Approved', 'Rejected']) {
      const doc = createMockApplicationDoc({ status: lockedStatus });
      StudentApplication.findById = async () => doc;

      const res = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ fullName: 'Updated Name' }),
      });

      assert.equal(res.status, 409);
      const body = await res.json();
      assert.match(body.message, /locked/i);
      assert.equal(doc.saveCalls, 0);
    }
  });

  test('21-22. Records only actual changed fields in audit history and skips history on no-op edits', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const staffToken = signTokenFor('65f000000000000000000003');

    // No-op edit: sending identical normalized values must NOT create a misleading history entry
    const noopDoc = createMockApplicationDoc();
    StudentApplication.findById = async () => noopDoc;

    const noopRes = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        fullName: '  Aarav Sharma  ',
        contactNumber: '+91 98765-43210',
      }),
    });

    assert.equal(noopRes.status, 200);
    const noopBody = await noopRes.json();
    assert.equal(noopBody.data.application.reviewHistory.length, 1);
    assert.equal(noopDoc.saveCalls, 0);

    // Partial edit with one unchanged and one changed field: only changed field appears
    const partialDoc = createMockApplicationDoc();
    StudentApplication.findById = async () => partialDoc;

    const partialRes = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        fullName: 'Aarav Sharma', // unchanged
        motherName: 'Sunita Sharma', // changed
      }),
    });

    assert.equal(partialRes.status, 200);
    const partialBody = await partialRes.json();
    assert.equal(partialBody.data.application.reviewHistory.length, 2);
    assert.deepEqual(partialBody.data.application.reviewHistory[1].changedFields, ['motherName']);
    assert.equal(partialDoc.saveCalls, 1);
  });

  test('23. Existing GET list and GET detail endpoints continue working', async () => {
    Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;
    const staffToken = signTokenFor('65f000000000000000000003');

    StudentApplication.countDocuments = async () => 1;
    StudentApplication.find = () => ({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            lean: async () => [
              {
                _id: '65f300000000000000000001',
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

    const listRes = await fetch(`${baseUrl}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(listRes.status, 200);

    StudentApplication.findById = () => ({
      populate: () => ({
        populate: () => ({
          lean: async () => createMockApplicationDoc().toObject(),
        }),
      }),
    });

    const detailRes = await fetch(`${baseUrl}/api/admin/applications/65f300000000000000000001`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(detailRes.status, 200);
  });
});
