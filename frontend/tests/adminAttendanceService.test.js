import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    location: { hostname: 'localhost' },
  };
}
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

const { default: API } = await import('../src/services/api.js');
const {
  getDailyAttendanceSheet,
  submitBulkAttendance,
  getMonthlyAttendanceSummary,
  getStudentAttendanceHistory,
} = await import('../src/services/adminAttendanceService.js');
const {
  getTodayIndiaDateKey,
  MAX_BULK_ATTENDANCE_ENTRIES,
} = await import('../src/utils/adminAttendanceUtils.js');

const originalGet = API.get.bind(API);
const originalPost = API.post.bind(API);

const VALID_ID_1 = '66f300000000000000000001';
const VALID_ID_2 = '66f300000000000000000002';

describe('Frontend adminAttendanceService Tests', () => {
  let capturedCalls = [];

  beforeEach(() => {
    capturedCalls = [];
  });

  afterEach(() => {
    API.get = originalGet;
    API.post = originalPost;
  });

  test('1-9. Daily sheet fetches Class 8/9 with exact params, preserves unmarked null, and rejects invalid inputs before API call', async () => {
    const today = getTodayIndiaDateKey();
    const mockSheetRes = {
      statusCode: 200,
      success: true,
      data: {
        sheet: {
          className: 'Class 8',
          attendanceDate: today,
          students: [{ studentId: VALID_ID_1, status: null, isMarked: false }],
          summary: { totalStudents: 1, presentCount: 0, absentCount: 0, unmarkedCount: 1 },
        },
      },
    };

    API.get = async (url, config) => {
      capturedCalls.push({ url, config });
      return { data: mockSheetRes };
    };

    const res8 = await getDailyAttendanceSheet({ className: 'Class 8', date: today });
    assert.deepEqual(res8, mockSheetRes);
    assert.equal(res8.data.sheet.students[0].status, null);
    assert.equal(capturedCalls[0].url, '/admin/attendance/sheet');
    assert.deepEqual(capturedCalls[0].config, {
      params: { className: 'Class 8', date: today },
    });

    await getDailyAttendanceSheet({ className: 'Class 9', date: '2026-11-01' });
    assert.deepEqual(capturedCalls[1].config, {
      params: { className: 'Class 9', date: '2026-11-01' },
    });

    const invalidInputs = [
      { date: today },
      { className: 'Class 10', date: today },
      { className: 'Class 8' },
      { className: 'Class 8', date: '2026-02-30' },
      { className: 'Class 8', date: '2099-01-01' },
    ];
    for (const bad of invalidInputs) {
      await assert.rejects(() => getDailyAttendanceSheet(bad));
    }
    assert.equal(capturedCalls.length, 2);
  });

  test('10-18. Bulk attendance submits valid Present/Absent entries and rejects invalid/duplicate/extra/oversized payloads before API call', async () => {
    const today = getTodayIndiaDateKey();
    const mockBulkRes = {
      statusCode: 200,
      success: true,
      data: {
        summary: {
          className: 'Class 8',
          attendanceDate: today,
          totalStudents: 2,
          presentCount: 1,
          absentCount: 1,
          markedCount: 2,
          createdCount: 2,
          updatedCount: 0,
        },
      },
    };

    API.post = async (url, body) => {
      capturedCalls.push({ url, body });
      return { data: mockBulkRes };
    };

    const res = await submitBulkAttendance({
      className: 'Class 8',
      attendanceDate: today,
      entries: [
        { studentId: VALID_ID_1, status: 'Present' },
        { studentId: VALID_ID_2, status: 'Absent' },
      ],
    });
    assert.deepEqual(res, mockBulkRes);
    assert.equal(capturedCalls[0].url, '/admin/attendance/bulk');
    assert.deepEqual(capturedCalls[0].body, {
      className: 'Class 8',
      attendanceDate: today,
      entries: [
        { studentId: VALID_ID_1, status: 'Present' },
        { studentId: VALID_ID_2, status: 'Absent' },
      ],
    });

    // > 500 entries rejected without silent truncation
    const tooManyEntries = Array.from({ length: MAX_BULK_ATTENDANCE_ENTRIES + 1 }, (_, idx) => ({
      studentId: `66f3${String(idx).padStart(20, '0')}`,
      status: 'Present',
    }));

    const badPayloads = [
      {
        className: 'Class 8',
        attendanceDate: today,
        entries: [{ studentId: VALID_ID_1, status: 'Half Day' }],
      },
      {
        className: 'Class 8',
        attendanceDate: today,
        entries: [
          { studentId: VALID_ID_1, status: 'Present' },
          { studentId: VALID_ID_1, status: 'Absent' },
        ],
      },
      {
        className: 'Class 8',
        attendanceDate: today,
        entries: [{ studentId: VALID_ID_1, status: 'Present', extra: true }],
      },
      { className: 'Class 8', attendanceDate: today, entries: [] },
      { className: 'Class 8', attendanceDate: today, entries: tooManyEntries },
      {
        className: 'Class 12',
        attendanceDate: today,
        entries: [{ studentId: VALID_ID_1, status: 'Present' }],
      },
      {
        className: 'Class 8',
        attendanceDate: '2099-01-01',
        entries: [{ studentId: VALID_ID_1, status: 'Present' }],
      },
    ];

    for (const bad of badPayloads) {
      await assert.rejects(() => submitBulkAttendance(bad));
    }
    assert.equal(capturedCalls.length, 1);
  });

  test('19-25. Monthly summary queries Class 8/9 with valid month, rejects invalid/future months, and returns summary unchanged', async () => {
    const currentMonth = getTodayIndiaDateKey().slice(0, 7);
    const mockSummaryRes = {
      statusCode: 200,
      success: true,
      data: {
        summary: { className: 'Class 8', month: currentMonth, overallRecordedDayPercentage: 75 },
        students: [],
        dailySummary: [],
      },
    };

    API.get = async (url, config) => {
      capturedCalls.push({ url, config });
      return { data: mockSummaryRes };
    };

    const res8 = await getMonthlyAttendanceSummary({
      className: 'Class 8',
      month: currentMonth,
    });
    assert.deepEqual(res8, mockSummaryRes);
    assert.equal(capturedCalls[0].url, '/admin/attendance/summary');
    assert.deepEqual(capturedCalls[0].config, {
      params: { className: 'Class 8', month: currentMonth },
    });

    await getMonthlyAttendanceSummary({ className: 'Class 9', month: '2026-10' });
    assert.deepEqual(capturedCalls[1].config, {
      params: { className: 'Class 9', month: '2026-10' },
    });

    for (const bad of [
      { className: 'Class 8', month: '2026/11' },
      { className: 'Class 8', month: '2026-13' },
      { className: 'Class 8', month: '2099-01' },
      { className: 'Class 7', month: currentMonth },
    ]) {
      await assert.rejects(() => getMonthlyAttendanceSummary(bad));
    }
    assert.equal(capturedCalls.length, 2);
  });

  test('26-30. Student history queries student/:studentId, rejects invalid ID/month, and retains historical class snapshots', async () => {
    const mockHistoryRes = {
      statusCode: 200,
      success: true,
      data: {
        student: { studentId: VALID_ID_1, currentClassName: 'Class 9' },
        month: '2026-11',
        history: [{ attendanceDate: '2026-11-05', className: 'Class 8', status: 'Present' }],
        summary: { presentCount: 1, absentCount: 0, markedDays: 1, attendancePercentage: 100 },
      },
    };

    API.get = async (url, config) => {
      capturedCalls.push({ url, config });
      return { data: mockHistoryRes };
    };

    const res = await getStudentAttendanceHistory(VALID_ID_1, '2026-11');
    assert.equal(capturedCalls[0].url, `/admin/attendance/student/${VALID_ID_1}`);
    assert.deepEqual(capturedCalls[0].config, { params: { month: '2026-11' } });
    assert.equal(res.data.history[0].className, 'Class 8');

    await assert.rejects(() => getStudentAttendanceHistory('bad-id', '2026-11'));
    await assert.rejects(() => getStudentAttendanceHistory(VALID_ID_1, '2099-01'));
    assert.equal(capturedCalls.length, 1);
  });

  test('31-36. Propagates Axios 400, 401, 403, 404, 409, 500, and network errors without swallowing', async () => {
    const today = getTodayIndiaDateKey();
    const currentMonth = today.slice(0, 7);

    for (const status of [400, 401, 403, 404, 409, 500]) {
      const apiError = Object.assign(new Error(`HTTP ${status}`), {
        response: { status, data: { message: `Err ${status}` } },
      });
      API.get = async () => {
        throw apiError;
      };
      API.post = async () => {
        throw apiError;
      };

      await assert.rejects(
        () => getDailyAttendanceSheet({ className: 'Class 8', date: today }),
        (err) => err.response.status === status
      );
      await assert.rejects(
        () =>
          submitBulkAttendance({
            className: 'Class 8',
            attendanceDate: today,
            entries: [{ studentId: VALID_ID_1, status: 'Present' }],
          }),
        (err) => err.response.status === status
      );
      await assert.rejects(
        () => getMonthlyAttendanceSummary({ className: 'Class 8', month: currentMonth }),
        (err) => err.response.status === status
      );
      await assert.rejects(
        () => getStudentAttendanceHistory(VALID_ID_1, currentMonth),
        (err) => err.response.status === status
      );
    }

    const netError = new Error('Network Error');
    API.get = async () => {
      throw netError;
    };
    await assert.rejects(
      () => getDailyAttendanceSheet({ className: 'Class 8', date: today }),
      (err) => err.message === 'Network Error'
    );
  });
});
