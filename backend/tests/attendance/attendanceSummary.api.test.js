import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import Student from '../../src/models/Student.js';
import Attendance from '../../src/models/Attendance.js';
import { getTodayIndiaDateKey } from '../../src/utils/attendanceDate.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_attendance_summary_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
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
    isActive: true,
    photo: { url: '', public_id: 'secret_pid' },
  },
  {
    _id: '66f300000000000000000002',
    fullName: 'Bhavna ZeroMarks',
    admissionNumber: undefined,
    className: 'Class 8',
    isActive: true,
  },
  {
    _id: '66f300000000000000000003',
    fullName: 'Chetan Inactive',
    admissionNumber: 'ADM-2026-0803',
    className: 'Class 8',
    isActive: false,
  },
  {
    _id: '66f300000000000000000004',
    fullName: 'Diya Transferred',
    admissionNumber: 'ADM-2026-0804',
    className: 'Class 9',
    isActive: true,
  },
];

describe('GET /api/admin/attendance/summary - Monthly Attendance Summary API', () => {
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

  const setupMocks = ({ students = BASE_STUDENTS, attendanceRecords = [] } = {}) => {
    let lastAttendanceFilter = null;
    let mutationCalled = false;

    Admin.findById = (id) => {
      const doc = MOCK_ADMINS[String(id)] || null;
      const promise = Promise.resolve(doc);
      promise.select = async () => doc;
      return promise;
    };

    Attendance.create = async () => {
      mutationCalled = true;
      throw new Error('Read-only summary must not mutate');
    };

    Student.find = (filter = {}) => ({
      async lean() {
        return students
          .filter((s) => {
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
          .map((s) => ({
            _id: s._id,
            fullName: s.fullName,
            admissionNumber: s.admissionNumber,
            className: s.className,
            isActive: s.isActive,
          }));
      },
    });

    Attendance.find = (filter = {}) => {
      lastAttendanceFilter = filter;
      return {
        async lean() {
          return attendanceRecords.filter((rec) => {
            if (filter.className && rec.className !== filter.className) return false;
            if (filter.attendanceDate?.$gte && rec.attendanceDate < filter.attendanceDate.$gte) {
              return false;
            }
            if (filter.attendanceDate?.$lte && rec.attendanceDate > filter.attendanceDate.$lte) {
              return false;
            }
            return true;
          });
        },
      };
    };

    return {
      getLastAttendanceFilter: () => lastAttendanceFilter,
      wasMutated: () => mutationCalled,
    };
  };

  test('1-2 & 9-10. Superadmin, Admin, and Staff can access current/past months; unauthenticated/unauthorized rejected', async () => {
    setupMocks();
    const currentMonth = getTodayIndiaDateKey().slice(0, 7);

    const unauthRes = await fetch(
      `${baseUrl}/api/admin/attendance/summary?className=Class%208&month=${currentMonth}`
    );
    assert.equal(unauthRes.status, 401);

    const forbiddenRes = await fetch(
      `${baseUrl}/api/admin/attendance/summary?className=Class%208&month=${currentMonth}`,
      { headers: { Authorization: `Bearer ${signTokenFor('65f000000000000000000004')}` } }
    );
    assert.equal(forbiddenRes.status, 403);

    for (const [userId, month] of [
      ['65f000000000000000000001', currentMonth],
      ['65f000000000000000000002', '2026-10'],
      ['65f000000000000000000003', currentMonth],
    ]) {
      const res = await fetch(
        `${baseUrl}/api/admin/attendance/summary?className=Class%208&month=${month}`,
        { headers: { Authorization: `Bearer ${signTokenFor(userId)}` } }
      );
      assert.equal(res.status, 200);
    }
  });

  test('3-8 & 11. Validates className and month format/calendar/future rules and computes exact month boundaries', async () => {
    const { getLastAttendanceFilter } = setupMocks();
    const token = signTokenFor('65f000000000000000000001');
    const currentMonth = getTodayIndiaDateKey().slice(0, 7);

    for (const badQuery of [
      `month=${currentMonth}`,
      `className=Class%2010&month=${currentMonth}`,
      `className=Class%208`,
      `className=Class%208&month=2026-11-01`,
      `className=Class%208&month=2026-13`,
      `className=Class%208&month=2026-00`,
      `className=Class%208&month=2099-01`,
      `className=Class%208&month=${currentMonth}&extra=1`,
    ]) {
      const res = await fetch(`${baseUrl}/api/admin/attendance/summary?${badQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(res.status, 400, `Expected 400 for ${badQuery}`);
    }

    // Leap-year February boundary check
    const febRes = await fetch(
      `${baseUrl}/api/admin/attendance/summary?className=Class%208&month=2024-02`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(febRes.status, 200);
    assert.deepEqual(getLastAttendanceFilter().attendanceDate, {
      $gte: '2024-02-01',
      $lte: '2024-02-29',
    });
  });

  test('12-19 & 21-22. Computes accurate class/student/daily summaries, handles zero-marks, inactive & transferred students, and mutates nothing', async () => {
    const attendanceRecords = [
      // Aarav: 2 Present, 1 Absent -> 66.67%
      { _id: '1', studentId: '66f300000000000000000001', className: 'Class 8', attendanceDate: '2026-11-10', status: 'Present' },
      { _id: '2', studentId: '66f300000000000000000001', className: 'Class 8', attendanceDate: '2026-11-05', status: 'Absent' },
      { _id: '3', studentId: '66f300000000000000000001', className: 'Class 8', attendanceDate: '2026-11-02', status: 'Present' },
      // Chetan (inactive): 1 Present -> 100%
      { _id: '4', studentId: '66f300000000000000000003', className: 'Class 8', attendanceDate: '2026-11-02', status: 'Present' },
      // Diya (now Class 9, was marked in Class 8): 1 Absent -> 0%
      { _id: '5', studentId: '66f300000000000000000004', className: 'Class 8', attendanceDate: '2026-11-05', status: 'Absent' },
    ];

    const { wasMutated } = setupMocks({ attendanceRecords });
    const token = signTokenFor('65f000000000000000000002');

    const res = await fetch(
      `${baseUrl}/api/admin/attendance/summary?className=Class%208&month=2026-11`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(wasMutated(), false);

    assert.deepEqual(body.data.summary, {
      className: 'Class 8',
      month: '2026-11',
      totalStudents: 4,
      totalRecordedDays: 3,
      presentCount: 3,
      absentCount: 2,
      markedCount: 5,
      overallRecordedDayPercentage: 60,
    });

    const aarav = body.data.students.find((s) => s.fullName === 'Aarav Sharma');
    assert.equal(aarav.attendancePercentage, 66.67);
    assert.equal(aarav.photo, undefined);

    const bhavna = body.data.students.find((s) => s.fullName === 'Bhavna ZeroMarks');
    assert.equal(bhavna.markedDays, 0);
    assert.equal(bhavna.attendancePercentage, 0);
    assert.equal(bhavna.admissionNumber, null);

    const chetan = body.data.students.find((s) => s.fullName === 'Chetan Inactive');
    assert.equal(chetan.isActive, false);
    assert.equal(chetan.presentCount, 1);

    const diya = body.data.students.find((s) => s.fullName === 'Diya Transferred');
    assert.equal(diya.currentClassName, 'Class 9');
    assert.equal(diya.attendanceClassName, 'Class 8');
    assert.equal(diya.absentCount, 1);

    // Daily summary sorted ascending
    assert.deepEqual(
      body.data.dailySummary.map((d) => d.attendanceDate),
      ['2026-11-02', '2026-11-05', '2026-11-10']
    );
  });

  test('20. Empty month returns valid zero-count report', async () => {
    setupMocks({ students: [], attendanceRecords: [] });
    const token = signTokenFor('65f000000000000000000003');

    const res = await fetch(
      `${baseUrl}/api/admin/attendance/summary?className=Class%209&month=2026-11`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.deepEqual(body.data.summary, {
      className: 'Class 9',
      month: '2026-11',
      totalStudents: 0,
      totalRecordedDays: 0,
      presentCount: 0,
      absentCount: 0,
      markedCount: 0,
      overallRecordedDayPercentage: 0,
    });
    assert.deepEqual(body.data.students, []);
    assert.deepEqual(body.data.dailySummary, []);
  });
});
