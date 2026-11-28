import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import StudentApplication, { CLASS_OPTIONS } from '../../src/models/StudentApplication.js';
import Student from '../../src/models/Student.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_admin_application_approval_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
const originalAppFindById = StudentApplication.findById.bind(StudentApplication);
const originalAppFindOneAndUpdate = StudentApplication.findOneAndUpdate.bind(StudentApplication);
const originalStudentCreate = Student.create.bind(Student);
const originalStartSession = mongoose.startSession.bind(mongoose);
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
  _id: '65f400000000000000000001',
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
  reviewedBy: null,
  reviewedAt: null,
  approvedStudentId: null,
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

const setupTransactionalDbMock = (initialApp = buildApplicationRecord(), options = {}) => {
  const state = {
    application: initialApp ? structuredClone(initialApp) : null,
    students: [],
    txStarted: 0,
    txCommitted: 0,
    txAborted: 0,
    txEnded: 0,
  };

  let pendingStudents = [];
  let pendingApplication = null;

  Admin.findById = async (id) => MOCK_ADMINS[String(id)] || null;

  mongoose.startSession = async () => ({
    startTransaction() {
      state.txStarted += 1;
      pendingStudents = [...state.students];
      pendingApplication = state.application ? structuredClone(state.application) : null;
    },
    async commitTransaction() {
      state.txCommitted += 1;
      state.students = pendingStudents;
      state.application = pendingApplication;
    },
    async abortTransaction() {
      state.txAborted += 1;
      pendingStudents = [];
      pendingApplication = null;
    },
    async endSession() {
      state.txEnded += 1;
    },
  });

  StudentApplication.findById = (id) => ({
    session: async () => {
      if (!pendingApplication || String(pendingApplication._id) !== String(id)) {
        return null;
      }
      return pendingApplication;
    },
  });

  Student.create = async (docs, createOpts = {}) => {
    assert.ok(createOpts.session, 'Student.create must run inside transaction session');
    if (options.failStudentCreate) {
      throw options.failStudentCreate;
    }

    const doc = docs[0];
    // Validate against real Student Mongoose schema
    const modelInstance = new Student(doc);
    await modelInstance.validate();

    const duplicate = pendingStudents.find(
      (s) => String(s.sourceApplicationId) === String(doc.sourceApplicationId)
    );
    if (duplicate) {
      const dupErr = new Error('E11000 duplicate key error collection: students index: sourceApplicationId_1');
      dupErr.code = 11000;
      throw dupErr;
    }

    const saved = modelInstance.toObject();
    pendingStudents.push(saved);
    return [saved];
  };

  StudentApplication.findOneAndUpdate = async (filter, update, updateOpts = {}) => {
    assert.ok(updateOpts.session, 'StudentApplication.findOneAndUpdate must run inside transaction session');
    if (options.failApplicationUpdate) {
      throw options.failApplicationUpdate;
    }
    if (!pendingApplication || String(pendingApplication._id) !== String(filter._id)) {
      return null;
    }
    if (filter.status?.$in && !filter.status.$in.includes(pendingApplication.status)) {
      return null;
    }
    if (options.simulateConcurrentModification) {
      return null;
    }

    if (update.$set) {
      Object.assign(pendingApplication, update.$set);
    }
    if (update.$push?.reviewHistory) {
      if (options.failAuditPush) {
        throw options.failAuditPush;
      }
      pendingApplication.reviewHistory.push(update.$push.reviewHistory);
    }
    return pendingApplication;
  };

  return state;
};

describe('PATCH /api/admin/applications/:id/approve - Approval & Permanent Student Creation', () => {
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
    mongoose.startSession = originalStartSession;
  });

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1-3 & 19. Superadmin, Admin, and Staff can approve and record accurate actorType in reviewHistory', async () => {
    const roles = [
      { userId: '65f000000000000000000001', expectedActor: 'Admin' },
      { userId: '65f000000000000000000002', expectedActor: 'Admin' },
      { userId: '65f000000000000000000003', expectedActor: 'Staff' },
    ];

    for (const { userId, expectedActor } of roles) {
      const state = setupTransactionalDbMock();
      const res = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${signTokenFor(userId)}`,
        },
        body: JSON.stringify({ note: 'Documents verified' }),
      });

      assert.equal(res.status, 200);
      assert.equal(state.txCommitted, 1);
      assert.equal(state.students.length, 1);
      assert.equal(state.application.status, 'Approved');

      const historyEntry = state.application.reviewHistory.at(-1);
      assert.equal(historyEntry.action, 'APPROVED');
      assert.equal(historyEntry.actorType, expectedActor);
      assert.equal(String(historyEntry.performedBy), userId);
      assert.equal(historyEntry.note, 'Documents verified');
    }
  });

  test('4. Staff can approve applications across all 12 classes', async () => {
    const staffToken = signTokenFor('65f000000000000000000003');

    for (const cls of CLASS_OPTIONS) {
      const state = setupTransactionalDbMock(buildApplicationRecord({ classApplyingFor: cls }));
      const res = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${staffToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.approval.className, cls);
      assert.equal(state.students[0].className, cls);
    }
  });

  test('5-6. Rejects unauthenticated requests (401) and unauthorized roles (403)', async () => {
    setupTransactionalDbMock();

    const unauthRes = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
      method: 'PATCH',
    });
    assert.equal(unauthRes.status, 401);

    const forbiddenRes = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000004')}` },
    });
    assert.equal(forbiddenRes.status, 403);
  });

  test('7-10. Validates ObjectId (400), missing application (404), unexpected fields (400), and note length (400)', async () => {
    const staffToken = signTokenFor('65f000000000000000000003');
    setupTransactionalDbMock();

    const badIdRes = await fetch(`${baseUrl}/api/admin/applications/invalid-id/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(badIdRes.status, 400);

    const missingState = setupTransactionalDbMock(null);
    const notFoundRes = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000099/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(notFoundRes.status, 404);
    assert.equal(missingState.txAborted, 1);

    setupTransactionalDbMock();
    for (const badBody of [
      { status: 'Approved' },
      { admittedBy: '65f000000000000000000001' },
      { fullName: 'Tampered Name' },
      { note: 12345 },
      { note: 'A'.repeat(501) },
    ]) {
      const badBodyRes = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify(badBody),
      });
      assert.equal(badBodyRes.status, 400);
    }
  });

  test('11-12 & 15-20. Approves Pending & Correction Requested, copies verified data, leaves admissionNumber unassigned, and sets approvedStudentId', async () => {
    const adminToken = signTokenFor('65f000000000000000000002');

    for (const startStatus of ['Pending', 'Correction Requested']) {
      const state = setupTransactionalDbMock(buildApplicationRecord({ status: startStatus }));
      const res = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.approval.status, 'Approved');
      assert.equal(body.data.approval.applicationNumber, 'SSG-2026-A1B2C3D4E5F60718');
      assert.equal(body.data.approval.studentName, 'Aarav Sharma');
      assert.equal(body.data.approval.className, 'Class 5');
      assert.ok(body.data.approval.approvedStudentId);
      assert.ok(body.data.approval.admittedAt);

      const student = state.students[0];
      assert.equal(student.fullName, 'Aarav Sharma');
      assert.equal(student.fatherName, 'Vikram Sharma');
      assert.equal(student.motherName, 'Priya Sharma');
      assert.equal(student.contactNumber, '9876543210');
      assert.equal(student.email, 'parent@example.com');
      assert.equal(
        student.photo.url,
        'https://res.cloudinary.com/demo/image/upload/v1/ss_global_school/student_applications/stu.jpg'
      );
      assert.equal(student.admissionNumber, undefined);
      assert.equal(student.isActive, true);
      assert.equal(String(student.sourceApplicationId), '65f400000000000000000001');
      assert.equal(String(state.application.approvedStudentId), String(student._id));
    }

    // Optional email & photo omitted when absent
    const stateNoOptionals = setupTransactionalDbMock(
      buildApplicationRecord({ email: undefined, photo: undefined })
    );
    const noOptRes = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(noOptRes.status, 200);
    assert.equal(stateNoOptionals.students[0].email, undefined);
    assert.deepEqual(stateNoOptionals.students[0].photo, { url: '', public_id: '' });
  });

  test('13-14 & 21. Rejects re-approving Approved or Rejected applications with HTTP 409 and never creates duplicate students', async () => {
    const adminToken = signTokenFor('65f000000000000000000002');

    for (const lockedStatus of ['Approved', 'Rejected']) {
      const state = setupTransactionalDbMock(buildApplicationRecord({ status: lockedStatus }));
      const res = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 409);
      assert.equal(state.students.length, 0);
      assert.equal(state.txAborted, 1);
      assert.equal(state.txCommitted, 0);
    }
  });

  test('22. Handles duplicate sourceApplicationId 11000 safely with HTTP 409 and transaction rollback', async () => {
    const dupErr = new Error('E11000 duplicate key error on sourceApplicationId');
    dupErr.code = 11000;
    const state = setupTransactionalDbMock(buildApplicationRecord(), {
      failStudentCreate: dupErr,
    });

    const res = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000002')}` },
    });

    assert.equal(res.status, 409);
    assert.equal(state.txAborted, 1);
    assert.equal(state.txCommitted, 0);
    assert.equal(state.students.length, 0);
    assert.equal(state.application.status, 'Pending');
  });

  test('23-27. Rolls back transaction completely on Student creation, Application update, or Audit push failures', async () => {
    const token = signTokenFor('65f000000000000000000001');

    // 23. Student creation failure
    const state1 = setupTransactionalDbMock(buildApplicationRecord(), {
      failStudentCreate: new Error('Student write error'),
    });
    const res1 = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res1.status, 500);
    assert.equal(state1.txAborted, 1);
    assert.equal(state1.students.length, 0);
    assert.equal(state1.application.status, 'Pending');

    // 24. Application update failure rolls back Student creation
    const state2 = setupTransactionalDbMock(buildApplicationRecord(), {
      failApplicationUpdate: new Error('Application update error'),
    });
    const res2 = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res2.status, 500);
    assert.equal(state2.txAborted, 1);
    assert.equal(state2.students.length, 0);
    assert.equal(state2.application.status, 'Pending');
    assert.equal(state2.application.approvedStudentId, null);

    // 25. Audit-history push failure rolls back Student creation
    const state3 = setupTransactionalDbMock(buildApplicationRecord(), {
      failAuditPush: new Error('History update error'),
    });
    const res3 = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res3.status, 500);
    assert.equal(state3.txAborted, 1);
    assert.equal(state3.students.length, 0);
    assert.equal(state3.application.status, 'Pending');

    // 26-27. Concurrent status change aborts and rolls back Student creation with HTTP 409
    const state4 = setupTransactionalDbMock(buildApplicationRecord(), {
      simulateConcurrentModification: true,
    });
    const res4 = await fetch(`${baseUrl}/api/admin/applications/65f400000000000000000001/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res4.status, 409);
    assert.equal(state4.txAborted, 1);
    assert.equal(state4.students.length, 0);
    assert.equal(state4.application.status, 'Pending');
  });
});
