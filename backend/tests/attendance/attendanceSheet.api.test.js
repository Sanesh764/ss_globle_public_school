import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import Admin from '../../src/models/Admin.js';
import Student from '../../src/models/Student.js';
import Attendance from '../../src/models/Attendance.js';
import { getTodayIndiaDateKey } from '../../src/utils/attendanceDate.js';

const TEST_JWT_SECRET = 'test_jwt_secret_for_attendance_sheet_2026';

let server;
let baseUrl;
const originalAdminFindById = Admin.findById.bind(Admin);
const originalStudentFind = Student.find.bind(Student);
const originalStudentCountDocuments = Student.countDocuments.bind(Student);
const originalAttendanceFind = Attendance.find.bind(Attendance);
const originalAttendanceCreate = Attendance.create.bind(Attendance);
const originalAttendanceBulkWrite = Attendance.bulkWrite.bind(Attendance);
const originalJwtSecret = process.env.JWT_SECRET;

const MOCK_ADMINS = {
  '65f000000000000000000001': {
    _id: '65f000000000000000000001',
    name: 'Super Admin',
    email: 'superadmin@ssglobal.edu.in',
    role: 'superadmin',
    isActive: true,
    password: 'hashed_password_never_expose',
  },
  '65f000000000000000000002': {
    _id: '65f000000000000000000002',
    name: 'School Admin',
    email: 'admin@ssglobal.edu.in',
    role: 'admin',
    isActive: true,
    password: 'hashed_password_never_expose',
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
    photo: {
      url: 'https://res.cloudinary.com/demo/image/upload/v1/aarav.jpg',
      public_id: 'ss-global/students/aarav_secret_id',
    },
    isActive: true,
  },
  {
    _id: '66f300000000000000000002',
    fullName: 'Bhavna Verma',
    admissionNumber: undefined,
    className: 'Class 8',
    photo: { url: '', public_id: '' },
    isActive: true,
  },
  {
    _id: '66f300000000000000000003',
    fullName: 'Chetan Patel',
    admissionNumber: 'ADM-2026-0803',
    className: 'Class 8',
    photo: { url: '', public_id: '' },
    isActive: true,
  },
  {
    _id: '66f300000000000000000004',
    fullName: 'Diya Inactive',
    admissionNumber: 'ADM-2026-0804',
    className: 'Class 8',
    photo: { url: '', public_id: '' },
    isActive: false,
  },
  {
    _id: '66f300000000000000000005',
    fullName: 'Eshan Class9',
    admissionNumber: 'ADM-2026-0901',
    className: 'Class 9',
    photo: { url: '', public_id: '' },
    isActive: true,
  },
];

describe('GET /api/admin/attendance/sheet - Daily Attendance Sheet API', () => {
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
    Student.countDocuments = originalStudentCountDocuments;
    Attendance.find = originalAttendanceFind;
    Attendance.create = originalAttendanceCreate;
    Attendance.bulkWrite = originalAttendanceBulkWrite;
  });

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  const setupMocks = ({ students = BASE_STUDENTS, attendanceRecords = [] } = {}) => {
    let mutationCalled = false;

    Admin.findById = (id) => {
      const doc = MOCK_ADMINS[String(id)] || null;
      const promise = Promise.resolve(doc);
      promise.select = async () => doc;
      return promise;
    };

    Attendance.create = async () => {
      mutationCalled = true;
      throw new Error('Read-only endpoint must not create attendance');
    };

    Attendance.bulkWrite = async () => {
      mutationCalled = true;
      throw new Error('Read-only endpoint must not write attendance');
    };

    const matchesStudentFilter = (doc, filter) => {
      if (filter.className && doc.className !== filter.className) return false;
      if (typeof filter.isActive === 'boolean' && doc.isActive !== filter.isActive) return false;
      return true;
    };

    Student.countDocuments = async (filter = {}) =>
      students.filter((s) => matchesStudentFilter(s, filter)).length;

    Student.find = (filter = {}) => {
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
          return students
            .filter((s) => matchesStudentFilter(s, filter))
            .map((s) => ({
              _id: s._id,
              fullName: s.fullName,
              admissionNumber: s.admissionNumber,
              className: s.className,
              photo: { url: s.photo?.url || '' },
              isActive: s.isActive,
            }));
        },
      };
      return chain;
    };

    Attendance.find = (filter = {}) => {
      const populatePaths = [];

      const chain = {
        populate(path) {
          populatePaths.push(path);
          return chain;
        },
        async lean() {
          const matched = attendanceRecords.filter((rec) => {
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
              copy.studentId = stu
                ? {
                    _id: stu._id,
                    fullName: stu.fullName,
                    admissionNumber: stu.admissionNumber,
                    className: stu.className,
                    photo: { url: stu.photo?.url || '' },
                    isActive: stu.isActive,
                  }
                : null;
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
        },
      };

      return chain;
    };

    return { wasMutated: () => mutationCalled };
  };

  test('1-3. Superadmin, Admin, and Staff can fetch Class 8 and Class 9 sheets equally', async () => {
    setupMocks();
    const today = getTodayIndiaDateKey();

    for (const [userId, cls] of [
      ['65f000000000000000000001', 'Class 8'],
      ['65f000000000000000000002', 'Class 9'],
      ['65f000000000000000000003', 'Class 8'],
    ]) {
      const token = signTokenFor(userId);
      const res = await fetch(
        `${baseUrl}/api/admin/attendance/sheet?className=${encodeURIComponent(cls)}&date=${today}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.sheet.className, cls);
      assert.equal(body.data.sheet.attendanceDate, today);
    }
  });

  test('4-5. Rejects unauthenticated requests (401) and unauthorized roles (403)', async () => {
    setupMocks();
    const today = getTodayIndiaDateKey();

    const unauthRes = await fetch(
      `${baseUrl}/api/admin/attendance/sheet?className=Class%208&date=${today}`
    );
    assert.equal(unauthRes.status, 401);

    const forbiddenToken = signTokenFor('65f000000000000000000004');
    const forbiddenRes = await fetch(
      `${baseUrl}/api/admin/attendance/sheet?className=Class%208&date=${today}`,
      { headers: { Authorization: `Bearer ${forbiddenToken}` } }
    );
    assert.equal(forbiddenRes.status, 403);
  });

  test('6-13. Validates required className (Class 8/9) and IST date (today/past accepted, future/invalid rejected)', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');
    const today = getTodayIndiaDateKey();

    const badQueries = [
      `date=${today}`, // missing className
      `className=Class%2010&date=${today}`, // unsupported class
      `className=Class%208`, // missing date
      `className=Class%208&date=2026/11/28`, // bad format
      `className=Class%208&date=2026-02-30`, // invalid calendar date
      `className=Class%208&date=2099-01-01`, // future date
      `className=Class%208&date=${today}&extra=1`, // unexpected query param
    ];

    for (const q of badQueries) {
      const res = await fetch(`${baseUrl}/api/admin/attendance/sheet?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(res.status, 400, `Expected 400 for query: ${q}`);
    }

    // Past date accepted
    const pastRes = await fetch(
      `${baseUrl}/api/admin/attendance/sheet?className=Class%208&date=2026-11-01`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(pastRes.status, 200);
  });

  test('14-20 & 23-24, 26-27. Merges active students with Present/Absent, preserves inactive & transferred history, excludes sensitive fields, and computes accurate summary', async () => {
    const attendanceRecords = [
      {
        _id: '67f100000000000000000001',
        studentId: '66f300000000000000000001',
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        status: 'Present',
        markedBy: '65f000000000000000000002',
        updatedBy: null,
        createdAt: '2026-11-20T04:00:00.000Z',
        updatedAt: '2026-11-20T04:00:00.000Z',
      },
      {
        _id: '67f100000000000000000002',
        studentId: '66f300000000000000000002',
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        status: 'Absent',
        markedBy: '65f000000000000000000003',
        updatedBy: '65f000000000000000000001',
        createdAt: '2026-11-20T04:00:00.000Z',
        updatedAt: '2026-11-20T05:00:00.000Z',
      },
      // Inactive student who was marked when active
      {
        _id: '67f100000000000000000003',
        studentId: '66f300000000000000000004',
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        status: 'Present',
        markedBy: '65f000000000000000000002',
        updatedBy: null,
        createdAt: '2026-11-20T04:00:00.000Z',
        updatedAt: '2026-11-20T04:00:00.000Z',
      },
      // Student who moved to Class 9 later but was marked in Class 8 on 2026-11-20
      {
        _id: '67f100000000000000000004',
        studentId: '66f300000000000000000005',
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        status: 'Present',
        markedBy: '65f000000000000000000002',
        updatedBy: null,
        createdAt: '2026-11-20T04:00:00.000Z',
        updatedAt: '2026-11-20T04:00:00.000Z',
      },
    ];

    const { wasMutated } = setupMocks({ attendanceRecords });
    const token = signTokenFor('65f000000000000000000001');

    const res = await fetch(
      `${baseUrl}/api/admin/attendance/sheet?className=Class%208&date=2026-11-20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(wasMutated(), false);

    const { sheet } = body.data;
    // 3 active Class 8 + 1 inactive historical + 1 transferred historical = 5 unique rows
    assert.equal(sheet.students.length, 5);
    assert.equal(new Set(sheet.students.map((s) => s.studentId)).size, 5);

    const aarav = sheet.students.find((s) => s.fullName === 'Aarav Sharma');
    assert.equal(aarav.status, 'Present');
    assert.equal(aarav.isMarked, true);
    assert.equal(aarav.photo.public_id, undefined);
    assert.equal(aarav.attendance.markedBy.password, undefined);

    const bhavna = sheet.students.find((s) => s.fullName === 'Bhavna Verma');
    assert.equal(bhavna.status, 'Absent');
    assert.equal(bhavna.admissionNumber, null);
    assert.deepEqual(bhavna.photo, { url: '' });

    const chetan = sheet.students.find((s) => s.fullName === 'Chetan Patel');
    assert.equal(chetan.status, null);
    assert.equal(chetan.isMarked, false);
    assert.equal(chetan.attendance, null);

    const diya = sheet.students.find((s) => s.fullName === 'Diya Inactive');
    assert.equal(diya.isActive, false);
    assert.equal(diya.status, 'Present');
    assert.equal(diya.isMarked, true);

    const eshan = sheet.students.find((s) => s.fullName === 'Eshan Class9');
    assert.equal(eshan.attendanceClassName, 'Class 8');
    assert.equal(eshan.currentClassName, 'Class 9');
    assert.equal(eshan.status, 'Present');

    assert.deepEqual(sheet.summary, {
      totalStudents: 5,
      presentCount: 3,
      absentCount: 1,
      unmarkedCount: 1,
      markedCount: 4,
      crossClassConflictCount: 0,
    });
  });

  test('21. Identifies same-day cross-class conflict safely when active student was already marked in another class', async () => {
    const attendanceRecords = [
      {
        _id: '67f100000000000000000009',
        studentId: '66f300000000000000000005', // currently Class 9
        className: 'Class 8',
        attendanceDate: '2026-11-20',
        status: 'Present',
        markedBy: '65f000000000000000000002',
        updatedBy: null,
      },
    ];

    setupMocks({ attendanceRecords });
    const token = signTokenFor('65f000000000000000000002');

    const res = await fetch(
      `${baseUrl}/api/admin/attendance/sheet?className=Class%209&date=2026-11-20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const body = await res.json();

    assert.equal(res.status, 200);
    const eshan = body.data.sheet.students[0];
    assert.equal(eshan.isMarked, false);
    assert.equal(eshan.status, null);
    assert.ok(eshan.crossClassConflict);
    assert.equal(eshan.crossClassConflict.className, 'Class 8');
    assert.equal(eshan.crossClassConflict.status, 'Present');
    assert.equal(body.data.sheet.summary.crossClassConflictCount, 1);
  });

  test('22 & 25. Handles missing Student population safely and returns empty 200 sheet for empty class', async () => {
    setupMocks({
      students: [],
      attendanceRecords: [
        {
          _id: '67f100000000000000000010',
          studentId: '66f399999999999999999999', // missing student doc
          className: 'Class 8',
          attendanceDate: '2026-11-20',
          status: 'Absent',
          markedBy: '65f000000000000000000002',
          updatedBy: null,
        },
      ],
    });
    const token = signTokenFor('65f000000000000000000003');

    const missingStuRes = await fetch(
      `${baseUrl}/api/admin/attendance/sheet?className=Class%208&date=2026-11-20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const missingStuBody = await missingStuRes.json();
    assert.equal(missingStuRes.status, 200);
    assert.equal(missingStuBody.data.sheet.students[0].fullName, 'Unavailable Student');
    assert.equal(missingStuBody.data.sheet.students[0].studentUnavailable, true);
    assert.equal(missingStuBody.data.sheet.students[0].status, 'Absent');

    // Empty class with no records
    setupMocks({ students: [], attendanceRecords: [] });
    const emptyRes = await fetch(
      `${baseUrl}/api/admin/attendance/sheet?className=Class%209&date=2026-11-20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const emptyBody = await emptyRes.json();
    assert.equal(emptyRes.status, 200);
    assert.deepEqual(emptyBody.data.sheet.students, []);
    assert.deepEqual(emptyBody.data.sheet.summary, {
      totalStudents: 0,
      presentCount: 0,
      absentCount: 0,
      unmarkedCount: 0,
      markedCount: 0,
      crossClassConflictCount: 0,
    });
  });

  test('28. Existing Student listing API remains unaffected', async () => {
    setupMocks();
    const token = signTokenFor('65f000000000000000000001');

    const res = await fetch(
      `${baseUrl}/api/admin/students?className=Class%208&isActive=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.data.students.length, 3);
  });
});
