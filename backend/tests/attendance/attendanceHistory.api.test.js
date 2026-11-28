import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import Student from '../../src/models/Student.js';
import Attendance from '../../src/models/Attendance.js';
import { getTodayIndiaDateKey } from '../../src/utils/attendanceDate.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_attendance_history_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
const originalStudentFindById = Student.findById.bind(Student);
const originalStudentFind = Student.find.bind(Student);
const originalAttendanceFind = Attendance.find.bind(Attendance);
const originalAttendanceCreate = Attendance.create.bind(Attendance);
const originalJwtSecret = process.env.JWT_SECRET;

const MOCK_ADMINS = {
  '65f000000000000000000001': {
    _id: '65f000000000000000000001',
    name: 'Super Admin',
    email: 'superadmin@ssglobal.edu.in',
    role: 'superadmin',
    isActive: true,
    password: 'secret_password',
  },
  '65f000000000000000000002': {
    _id: '65f000000000000000000002',
    name: 'School Admin',
    email: 'admin@ssglobal.edu.in',
    role: 'admin',
    isActive: true,
    password: 'secret_password',
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

const MOCK_STUDENTS = {
  '66f300000000000000000001': {
    _id: '66f300000000000000000001',
    fullName: 'Aarav Sharma',
    admissionNumber: 'ADM-2026-0801',
    className: 'Class 9',
    isActive: true,
  },
  '66f300000000000000000002': {
    _id: '66f300000000000000000002',
    fullName: 'Bhavna Inactive',
    admissionNumber: null,
    className: 'Class 8',
    isActive: false,
  },
};

describe('GET /api/admin/attendance/student/:studentId - Student Attendance History API', () => {
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
    Student.find = originalStudentFind;
    Attendance.find = originalAttendanceFind;
    Attendance.create = originalAttendanceCreate;
  });

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  const setupMocks = ({ students = MOCK_STUDENTS, attendanceRecords = [] } = {}) => {
    let mutationCalled = false;

    Admin.findById = (id) => {
      const doc = MOCK_ADMINS[String(id)] || null;
      const promise = Promise.resolve(doc);
      promise.select = async () => doc;
      return promise;
    };

    Attendance.create = async () => {
      mutationCalled = true;
      throw new Error('Read-only history must not mutate');
    };

    Student.findById = (id) => ({
      async lean() {
        return students[String(id)] || null;
      },
    });

    Student.find = (filter = {}) => {
      const chain = {
        sort() {
          return chain;
        },
        async lean() {
          return Object.values(students).filter((s) => {
            if (filter.className && s.className !== filter.className) return false;
            if (typeof filter.isActive === 'boolean' && s.isActive !== filter.isActive) {
              return false;
            }
            return true;
          });
        },
      };
      return chain;
    };

    Attendance.find = (filter = {}) => {
      const populatePaths = [];
      let sortSpec = null;

      const chain = {
        sort(spec) {
          sortSpec = spec;
          return chain;
        },
        populate(path) {
          populatePaths.push(path);
          return chain;
        },
        async lean() {
          let matched = attendanceRecords.filter((rec) => {
            if (filter.studentId && String(rec.studentId) !== String(filter.studentId)) {
              return false;
            }
            if (filter.className && rec.className !== filter.className) return false;
            if (filter.attendanceDate?.$gte && rec.attendanceDate < filter.attendanceDate.$gte) {
              return false;
            }
            if (filter.attendanceDate?.$lte && rec.attendanceDate > filter.attendanceDate.$lte) {
              return false;
            }
            if (typeof filter.attendanceDate === 'string' && rec.attendanceDate !== filter.attendanceDate) {
              return false;
            }
            return true;
          });

          if (sortSpec?.attendanceDate === -1) {
            matched = [...matched].sort((a, b) =>
              b.attendanceDate.localeCompare(a.attendanceDate)
            );
          }

          return matched.map((rec) => {
            const copy = { ...rec };
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
        },
      };

      return chain;
    };

    return { wasMutated: () => mutationCalled };
  };

  test('1-3. Superadmin, Admin, and Staff can access history; 401/403 enforced', async () => {
    setupMocks();
    const month = getTodayIndiaDateKey().slice(0, 7);

    const unauthRes = await fetch(
      `${baseUrl}/api/admin/attendance/student/66f300000000000000000001?month=${month}`
    );
    assert.equal(unauthRes.status, 401);

    const forbiddenRes = await fetch(
      `${baseUrl}/api/admin/attendance/student/66f300000000000000000001?month=${month}`,
      { headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000004')}` } }
    );
    assert.equal(forbiddenRes.status, 403);

    for (const userId of [
      '65f000000000000000000001',
      '65f000000000000000000002',
      '65f000000000000000000003',
    ]) {
      const res = await fetch(
        `${baseUrl}/api/admin/attendance/student/66f300000000000000000001?month=${month}`,
        { headers: { Authorization: `Bearer ${signTokenFor(userId)}` } }
      );
      assert.equal(res.status, 200);
    }
  });

  test('4-6. Rejects invalid ObjectId (400), nonexistent student (404), and missing/invalid month (400)', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const badIdRes = await fetch(
      `${baseUrl}/api/admin/attendance/student/not-an-id?month=2026-11`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(badIdRes.status, 400);

    const notFoundRes = await fetch(
      `${baseUrl}/api/admin/attendance/student/66f399999999999999999999?month=2026-11`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(notFoundRes.status, 404);

    for (const q of ['', '?month=2026/11', '?month=2099-01', '?month=2026-11&extra=1']) {
      const res = await fetch(
        `${baseUrl}/api/admin/attendance/student/66f300000000000000000001${q}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      assert.equal(res.status, 400, `Expected 400 for query "${q}"`);
    }
  });

  test('7-14 & 16. Returns Class 8 & 9 historical snapshots newest-first, safe admin population, accurate totals, and preserves inactive history', async () => {
    const attendanceRecords = [
      {
        _id: '67f100000000000000000001',
        studentId: '66f300000000000000000001',
        className: 'Class 8',
        attendanceDate: '2026-11-02',
        status: 'Present',
        markedBy: '65f000000000000000000002',
        updatedBy: null,
      },
      {
        _id: '67f100000000000000000002',
        studentId: '66f300000000000000000001',
        className: 'Class 9',
        attendanceDate: '2026-11-15',
        status: 'Absent',
        markedBy: '65f000000000000000000003',
        updatedBy: '65f000000000000000000001',
      },
      {
        _id: '67f100000000000000000003',
        studentId: '66f300000000000000000002', // inactive student
        className: 'Class 8',
        attendanceDate: '2026-11-05',
        status: 'Present',
        markedBy: '65f000000000000000000002',
        updatedBy: null,
      },
    ];

    const { wasMutated } = setupMocks({ attendanceRecords });
    const token = signTokenFor('65f000000000000000000002');

    // Active student with Class 8 + Class 9 records
    const res = await fetch(
      `${baseUrl}/api/admin/attendance/student/66f300000000000000000001?month=2026-11`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(wasMutated(), false);
    assert.equal(body.data.student.currentClassName, 'Class 9');
    assert.deepEqual(
      body.data.history.map((h) => h.attendanceDate),
      ['2026-11-15', '2026-11-02'] // newest first
    );
    assert.equal(body.data.history[0].className, 'Class 9');
    assert.equal(body.data.history[1].className, 'Class 8');
    assert.equal(body.data.history[0].markedBy.password, undefined);
    assert.equal(body.data.history[0].updatedBy.password, undefined);
    assert.deepEqual(body.data.summary, {
      presentCount: 1,
      absentCount: 1,
      markedDays: 2,
      attendancePercentage: 50,
    });

    // Inactive student history preserved
    const inactiveRes = await fetch(
      `${baseUrl}/api/admin/attendance/student/66f300000000000000000002?month=2026-11`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const inactiveBody = await inactiveRes.json();
    assert.equal(inactiveRes.status, 200);
    assert.equal(inactiveBody.data.student.isActive, false);
    assert.equal(inactiveBody.data.history.length, 1);
    assert.equal(inactiveBody.data.summary.attendancePercentage, 100);
  });

  test('15 & 17. Zero-record history returns empty array and existing sheet API remains unaffected', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000003');

    const emptyRes = await fetch(
      `${baseUrl}/api/admin/attendance/student/66f300000000000000000001?month=2026-10`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const emptyBody = await emptyRes.json();
    assert.equal(emptyRes.status, 200);
    assert.deepEqual(emptyBody.data.history, []);
    assert.deepEqual(emptyBody.data.summary, {
      presentCount: 0,
      absentCount: 0,
      markedDays: 0,
      attendancePercentage: 0,
    });

    const sheetRes = await fetch(
      `${baseUrl}/api/admin/attendance/sheet?className=Class%208&date=2026-11-20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(sheetRes.status, 200);
  });
});
