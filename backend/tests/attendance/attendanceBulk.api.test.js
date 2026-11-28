import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import Student from '../../src/models/Student.js';
import Attendance from '../../src/models/Attendance.js';
import { getTodayIndiaDateKey } from '../../src/utils/attendanceDate.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_attendance_bulk_2026';

let server;
let baseUrl;
const originalStartSession = mongoose.startSession.bind(mongoose);
const originalAdminFindById = Admin.findById.bind(Admin);
const originalStudentFind = Student.find.bind(Student);
const originalAttendanceFind = Attendance.find.bind(Attendance);
const originalAttendanceBulkWrite = Attendance.bulkWrite.bind(Attendance);
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
    name: 'Parent User',
    email: 'parent@example.com',
    role: 'parent',
    isActive: true,
  },
};

const signTokenFor = (userId) =>
  jwt.sign({ userId }, TEST_JWT_SECRET, { expiresIn: '1h' });

const BASE_STUDENTS = [
  {
    _id: '66f300000000000000000001',
    fullName: 'Aarav Sharma',
    admissionNumber: 'ADM-2026-0801',
    className: 'Class 8',
    photo: { url: '' },
    isActive: true,
  },
  {
    _id: '66f300000000000000000002',
    fullName: 'Bhavna Verma',
    admissionNumber: 'ADM-2026-0802',
    className: 'Class 8',
    photo: { url: '' },
    isActive: true,
  },
  {
    _id: '66f300000000000000000003',
    fullName: 'Chetan Inactive',
    admissionNumber: 'ADM-2026-0803',
    className: 'Class 8',
    photo: { url: '' },
    isActive: false,
  },
  {
    _id: '66f300000000000000000004',
    fullName: 'Diya Class9',
    admissionNumber: 'ADM-2026-0901',
    className: 'Class 9',
    photo: { url: '' },
    isActive: true,
  },
];

describe('POST /api/admin/attendance/bulk - Bulk Attendance Submission & Update API', () => {
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
    mongoose.startSession = originalStartSession;
    Admin.findById = originalAdminFindById;
    Student.find = originalStudentFind;
    Attendance.find = originalAttendanceFind;
    Attendance.bulkWrite = originalAttendanceBulkWrite;
  });

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  const setupMocks = ({
    students = BASE_STUDENTS,
    initialAttendance = [],
    bulkWriteError = null,
  } = {}) => {
    const attendanceStore = initialAttendance.map((r) => ({ ...r }));
    let stagedSnapshot = null;
    const sessionStats = {
      started: 0,
      committed: 0,
      aborted: 0,
      ended: 0,
      inFlightSessionOps: 0,
      maxConcurrentSessionOps: 0,
    };

    const runWithSessionLock = async (hasSession, fn) => {
      if (!hasSession) {
        return fn();
      }
      sessionStats.inFlightSessionOps += 1;
      if (sessionStats.inFlightSessionOps > sessionStats.maxConcurrentSessionOps) {
        sessionStats.maxConcurrentSessionOps = sessionStats.inFlightSessionOps;
      }
      if (sessionStats.inFlightSessionOps > 1) {
        sessionStats.inFlightSessionOps -= 1;
        throw Object.assign(
          new Error(
            'Only servers in a sharded cluster can start a new transaction at the active transaction number'
          ),
          { code: 251, codeName: 'NoSuchTransaction' }
        );
      }
      try {
        await Promise.resolve();
        return await fn();
      } finally {
        sessionStats.inFlightSessionOps -= 1;
      }
    };

    mongoose.startSession = async () => ({
      startTransaction() {
        sessionStats.started += 1;
        stagedSnapshot = attendanceStore.map((r) => ({ ...r }));
      },
      async commitTransaction() {
        sessionStats.committed += 1;
        stagedSnapshot = null;
      },
      async abortTransaction() {
        sessionStats.aborted += 1;
        if (stagedSnapshot !== null) {
          attendanceStore.length = 0;
          attendanceStore.push(...stagedSnapshot);
          stagedSnapshot = null;
        }
      },
      async endSession() {
        sessionStats.ended += 1;
      },
    });

    Admin.findById = (id) => {
      const doc = MOCK_ADMINS[String(id)] || null;
      const promise = Promise.resolve(doc);
      promise.select = async () => doc;
      return promise;
    };

    Student.find = (filter = {}) => {
      let usesSession = false;
      const chain = {
        session() {
          usesSession = true;
          return chain;
        },
        sort() {
          return chain;
        },
        async lean() {
          return runWithSessionLock(usesSession, async () =>
            students.filter((s) => {
              if (filter.className && s.className !== filter.className) return false;
              if (typeof filter.isActive === 'boolean' && s.isActive !== filter.isActive) {
                return false;
              }
              if (filter._id?.$in) {
                const ids = filter._id.$in.map(String);
                if (!ids.includes(String(s._id))) return false;
              }
              return true;
            })
          );
        },
      };
      return chain;
    };

    Attendance.find = (filter = {}) => {
      const populatePaths = [];
      let usesSession = false;
      const chain = {
        session() {
          usesSession = true;
          return chain;
        },
        populate(path) {
          populatePaths.push(path);
          return chain;
        },
        async lean() {
          return runWithSessionLock(usesSession, async () => {
            const matched = attendanceStore.filter((rec) => {
            if (rec.attendanceDate !== filter.attendanceDate) return false;
            if (typeof filter.className === 'string' && rec.className !== filter.className) {
              return false;
            }
            if (filter.className?.$ne && rec.className === filter.className.$ne) {
              return false;
            }
            if (filter.studentId?.$in) {
              const ids = filter.studentId.$in.map(String);
              if (!ids.includes(String(rec.studentId))) return false;
            }
            return true;
          });

          return matched.map((rec) => {
            const copy = { ...rec };
            if (populatePaths.includes('studentId')) {
              const stu = students.find((s) => String(s._id) === String(rec.studentId));
              copy.studentId = stu ? { ...stu } : null;
            }
            if (populatePaths.includes('markedBy')) {
              const adminDoc = MOCK_ADMINS[String(rec.markedBy)];
              copy.markedBy = adminDoc
                ? { name: adminDoc.name, email: adminDoc.email, role: adminDoc.role }
                : null;
            }
            if (populatePaths.includes('updatedBy')) {
              const adminDoc = rec.updatedBy ? MOCK_ADMINS[String(rec.updatedBy)] : null;
              copy.updatedBy = adminDoc
                ? { name: adminDoc.name, email: adminDoc.email, role: adminDoc.role }
                : null;
            }
              return copy;
            });
          });
        },
      };
      return chain;
    };

    Attendance.bulkWrite = async (ops, options = {}) =>
      runWithSessionLock(Boolean(options?.session), async () => {
        if (bulkWriteError) {
        // Simulate partial write before failure to verify abortTransaction rollback
        attendanceStore.push({
          _id: '67f999999999999999999999',
          studentId: 'partial',
          status: 'Present',
        });
        throw bulkWriteError;
      }

      for (const op of ops) {
        if (op.insertOne) {
          const doc = op.insertOne.document;
          const dup = attendanceStore.find(
            (r) =>
              String(r.studentId) === String(doc.studentId) &&
              r.attendanceDate === doc.attendanceDate
          );
          if (dup) {
            throw Object.assign(new Error('E11000 duplicate key'), { code: 11000 });
          }
          attendanceStore.push({
            _id: `67f2000000000000000000${String(attendanceStore.length + 1).padStart(2, '0')}`,
            ...doc,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else if (op.updateOne) {
          const { filter, update } = op.updateOne;
          const target = attendanceStore.find((r) => String(r._id) === String(filter._id));
          if (target && update.$set) {
            Object.assign(target, update.$set, { updatedAt: new Date().toISOString() });
          }
        }
      }

        return { ok: 1 };
      });

    return { attendanceStore, sessionStats };
  };

  test('1-3, 11, 24, 29 & 32. Superadmin, Admin, and Staff can submit new Class 8/9 attendance for today/past dates with markedBy and updatedBy: null', async () => {
    const today = getTodayIndiaDateKey();

    for (const [userId, className, date, entries] of [
      [
        '65f000000000000000000001',
        'Class 8',
        today,
        [
          { studentId: '66f300000000000000000001', status: 'Present' },
          { studentId: '66f300000000000000000002', status: 'Absent' },
        ],
      ],
      [
        '65f000000000000000000002',
        'Class 9',
        '2026-11-20',
        [{ studentId: '66f300000000000000000004', status: 'Present' }],
      ],
      [
        '65f000000000000000000003',
        'Class 8',
        '2026-11-15',
        [
          { studentId: '66f300000000000000000001', status: 'Absent' },
          { studentId: '66f300000000000000000002', status: 'Present' },
        ],
      ],
    ]) {
      const { attendanceStore, sessionStats } = setupMocks();
      const token = signTokenFor(userId);

      const res = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ className, attendanceDate: date, entries }),
      });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.summary.createdCount, entries.length);
      assert.equal(body.data.summary.updatedCount, 0);
      assert.equal(sessionStats.committed, 1);
      assert.equal(sessionStats.aborted, 0);
      assert.equal(sessionStats.ended, 1);
      assert.ok(attendanceStore.every((r) => String(r.markedBy) === userId && r.updatedBy === null));
    }
  });

  test('4-5. Rejects unauthenticated (401) and unauthorized role (403)', async () => {
    setupMocks();
    const today = getTodayIndiaDateKey();

    const unauthRes = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 9',
        attendanceDate: today,
        entries: [{ studentId: '66f300000000000000000004', status: 'Present' }],
      }),
    });
    assert.equal(unauthRes.status, 401);

    const forbiddenToken = signTokenFor('65f000000000000000000004');
    const forbiddenRes = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${forbiddenToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        className: 'Class 9',
        attendanceDate: today,
        entries: [{ studentId: '66f300000000000000000004', status: 'Present' }],
      }),
    });
    assert.equal(forbiddenRes.status, 403);
  });

  test('6-10 & 12-17. Rejects invalid class, date, status, empty/duplicate/malformed entries, and unknown fields with 400', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');
    const today = getTodayIndiaDateKey();

    const badPayloads = [
      { attendanceDate: today, entries: [{ studentId: '66f300000000000000000004', status: 'Present' }] },
      { className: 'Class 10', attendanceDate: today, entries: [{ studentId: '66f300000000000000000004', status: 'Present' }] },
      { className: 'Class 9', entries: [{ studentId: '66f300000000000000000004', status: 'Present' }] },
      { className: 'Class 9', attendanceDate: '2026/11/28', entries: [{ studentId: '66f300000000000000000004', status: 'Present' }] },
      { className: 'Class 9', attendanceDate: '2099-01-01', entries: [{ studentId: '66f300000000000000000004', status: 'Present' }] },
      { className: 'Class 9', attendanceDate: today, entries: [{ studentId: '66f300000000000000000004', status: 'Half Day' }] },
      { className: 'Class 9', attendanceDate: today, entries: [] },
      { className: 'Class 9', attendanceDate: today, entries: [{ studentId: 'bad-id', status: 'Present' }] },
      {
        className: 'Class 9',
        attendanceDate: today,
        entries: [
          { studentId: '66f300000000000000000004', status: 'Present' },
          { studentId: '66f300000000000000000004', status: 'Absent' },
        ],
      },
      {
        className: 'Class 9',
        attendanceDate: today,
        extraField: true,
        entries: [{ studentId: '66f300000000000000000004', status: 'Present' }],
      },
      {
        className: 'Class 9',
        attendanceDate: today,
        entries: [{ studentId: '66f300000000000000000004', status: 'Present', note: 'extra' }],
      },
    ];

    for (const payload of badPayloads) {
      const res = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      assert.equal(res.status, 400, `Expected 400 for ${JSON.stringify(payload)}`);
    }
  });

  test('18-20 & 33. Rejects missing active roster, cross-class student, inactive student without record, nonexistent student (404), and empty class (400)', async () => {
    const today = getTodayIndiaDateKey();
    const token = signTokenFor('65f000000000000000000002');

    // Missing active roster member -> 409
    setupMocks();
    const incompleteRes = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 8',
        attendanceDate: today,
        entries: [{ studentId: '66f300000000000000000001', status: 'Present' }],
      }),
    });
    assert.equal(incompleteRes.status, 409);

    // Extra student from Class 9 in Class 8 -> 409
    setupMocks();
    const wrongClassRes = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 8',
        attendanceDate: today,
        entries: [
          { studentId: '66f300000000000000000001', status: 'Present' },
          { studentId: '66f300000000000000000002', status: 'Present' },
          { studentId: '66f300000000000000000004', status: 'Present' },
        ],
      }),
    });
    assert.equal(wrongClassRes.status, 409);

    // Inactive student without existing attendance -> 409
    setupMocks();
    const inactiveRes = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 8',
        attendanceDate: today,
        entries: [
          { studentId: '66f300000000000000000001', status: 'Present' },
          { studentId: '66f300000000000000000002', status: 'Present' },
          { studentId: '66f300000000000000000003', status: 'Absent' },
        ],
      }),
    });
    assert.equal(inactiveRes.status, 409);

    // Nonexistent student -> 404
    setupMocks();
    const notFoundRes = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 9',
        attendanceDate: today,
        entries: [{ studentId: '66f399999999999999999999', status: 'Present' }],
      }),
    });
    assert.equal(notFoundRes.status, 404);

    // Empty class -> 400
    setupMocks({ students: [] });
    const emptyClassRes = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 8',
        attendanceDate: today,
        entries: [{ studentId: '66f300000000000000000001', status: 'Present' }],
      }),
    });
    assert.equal(emptyClassRes.status, 400);
  });

  test('21-23 & 26-27. Updates existing attendance preserving markedBy, setting updatedBy, and supporting inactive/transferred historical corrections', async () => {
    const initialAttendance = [
      {
        _id: '67f100000000000000000001',
        studentId: '66f300000000000000000001',
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        status: 'Present',
        markedBy: '65f000000000000000000002',
        updatedBy: null,
      },
      {
        _id: '67f100000000000000000002',
        studentId: '66f300000000000000000003', // deactivated later
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        status: 'Present',
        markedBy: '65f000000000000000000002',
        updatedBy: null,
      },
      {
        _id: '67f100000000000000000003',
        studentId: '66f300000000000000000004', // transferred to Class 9 later
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        status: 'Absent',
        markedBy: '65f000000000000000000002',
        updatedBy: null,
      },
    ];

    const { attendanceStore } = setupMocks({ initialAttendance });
    const staffToken = signTokenFor('65f000000000000000000003');

    const res = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        entries: [
          { studentId: '66f300000000000000000001', status: 'Absent' }, // existing active updated
          { studentId: '66f300000000000000000002', status: 'Present' }, // new active created
          { studentId: '66f300000000000000000003', status: 'Absent' }, // existing inactive updated
          { studentId: '66f300000000000000000004', status: 'Present' }, // existing transferred updated
        ],
      }),
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.deepEqual(body.data.summary, {
      className: 'Class 8',
      attendanceDate: '2026-11-20',
      totalStudents: 4,
      presentCount: 2,
      absentCount: 2,
      markedCount: 4,
      createdCount: 1,
      updatedCount: 3,
    });
    assert.equal(attendanceStore.length, 4);

    const updatedRec = attendanceStore.find(
      (r) => String(r.studentId) === '66f300000000000000000001'
    );
    assert.equal(updatedRec.status, 'Absent');
    assert.equal(updatedRec.markedBy, '65f000000000000000000002'); // preserved
    assert.equal(updatedRec.updatedBy, '65f000000000000000000003'); // updated

    const newRec = attendanceStore.find(
      (r) => String(r.studentId) === '66f300000000000000000002'
    );
    assert.equal(newRec.markedBy, '65f000000000000000000003');
    assert.equal(newRec.updatedBy, null);
  });

  test('25 & 28. Rejects same-day cross-class conflict and handles 11000 duplicate-key errors with 409', async () => {
    const initialAttendance = [
      {
        _id: '67f100000000000000000009',
        studentId: '66f300000000000000000004',
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        status: 'Present',
        markedBy: '65f000000000000000000002',
        updatedBy: null,
      },
    ];

    setupMocks({ initialAttendance });
    const token = signTokenFor('65f000000000000000000001');

    const crossClassRes = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 9',
        attendanceDate: '2026-11-20',
        entries: [{ studentId: '66f300000000000000000004', status: 'Present' }],
      }),
    });
    assert.equal(crossClassRes.status, 409);

    setupMocks({
      bulkWriteError: Object.assign(new Error('Duplicate key'), { code: 11000 }),
    });
    const dupRes = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 9',
        attendanceDate: '2026-11-20',
        entries: [{ studentId: '66f300000000000000000004', status: 'Present' }],
      }),
    });
    assert.equal(dupRes.status, 409);
  });

  test('30-31 & 34-35. Aborts transaction on bulkWrite failure leaving zero partial records and preserves GET /sheet', async () => {
    const { attendanceStore, sessionStats } = setupMocks({
      bulkWriteError: new Error('Simulated DB write failure'),
    });
    const token = signTokenFor('65f000000000000000000001');

    const failRes = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        entries: [
          { studentId: '66f300000000000000000001', status: 'Present' },
          { studentId: '66f300000000000000000002', status: 'Absent' },
        ],
      }),
    });

    assert.equal(failRes.status, 500);
    const failBody = await failRes.json();
    assert.equal(
      failBody.message,
      'Unable to save attendance due to a database transaction error. Please try again.'
    );
    assert.equal(sessionStats.aborted, 1);
    assert.equal(sessionStats.committed, 0);
    assert.equal(sessionStats.ended, 1);
    assert.equal(sessionStats.maxConcurrentSessionOps, 1);
    assert.equal(attendanceStore.length, 0);

    const sheetRes = await fetch(
      `${baseUrl}/api/admin/attendance/sheet?className=Class%208&date=2026-11-20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(sheetRes.status, 200);
  });

  test('36. Executes all transaction session operations sequentially without parallel session calls', async () => {
    const { attendanceStore, sessionStats } = setupMocks();
    const token = signTokenFor('65f000000000000000000002');

    const res = await fetch(`${baseUrl}/api/admin/attendance/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: 'Class 8',
        attendanceDate: '2026-11-21',
        entries: [
          { studentId: '66f300000000000000000001', status: 'Present' },
          { studentId: '66f300000000000000000002', status: 'Absent' },
        ],
      }),
    });

    assert.equal(res.status, 200);
    assert.equal(sessionStats.started, 1);
    assert.equal(sessionStats.committed, 1);
    assert.equal(sessionStats.aborted, 0);
    assert.equal(sessionStats.ended, 1);
    assert.equal(sessionStats.maxConcurrentSessionOps, 1);
    assert.equal(attendanceStore.length, 2);
  });
});
