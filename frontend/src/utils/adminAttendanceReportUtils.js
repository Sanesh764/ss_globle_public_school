import {
  ATTENDANCE_CLASS_OPTIONS,
  getTodayIndiaDateKey,
  isAttendanceClass,
  isValidAttendanceMonth,
  isValidObjectId,
} from './adminAttendanceUtils.js';

export const DEFAULT_REPORT_CLASS = ATTENDANCE_CLASS_OPTIONS[0];

/**
 * Return the current month key (YYYY-MM) in Asia/Kolkata timezone.
 */
export const getCurrentIndiaMonthKey = (referenceDate = new Date()) =>
  getTodayIndiaDateKey(referenceDate).slice(0, 7);

/**
 * Safely format a recorded-day attendance percentage without ever producing
 * NaN, Infinity, or a misleading 100% on zero recorded days.
 */
export const formatRecordedPercentage = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return '0%';
  }
  const rounded = Math.round(num * 100) / 100;
  return `${rounded}%`;
};

/**
 * Normalize the GET /api/admin/attendance/summary response into a predictable shape.
 */
export const normalizeMonthlySummaryResponse = (res) => {
  const rawData = res?.data;
  const rawSummary = rawData?.summary;
  if (!rawSummary || typeof rawSummary !== 'object') {
    return null;
  }

  const rawStudents = Array.isArray(rawData.students) ? rawData.students : [];
  const rawDaily = Array.isArray(rawData.dailySummary) ? rawData.dailySummary : [];

  const totalRecordedDays = Number(rawSummary.totalRecordedDays) || 0;
  const presentCount = Number(rawSummary.presentCount) || 0;
  const absentCount = Number(rawSummary.absentCount) || 0;
  const markedCount = Number(rawSummary.markedCount) || 0;
  const rawOverallPct = Number(rawSummary.overallRecordedDayPercentage);
  const overallRecordedDayPercentage =
    totalRecordedDays === 0 || markedCount === 0 || !Number.isFinite(rawOverallPct)
      ? 0
      : rawOverallPct;

  const students = rawStudents.map((stu) => {
    const markedDays = Number(stu.markedDays) || 0;
    const stuPct = Number(stu.attendancePercentage);
    return {
      studentId: stu.studentId || '',
      fullName: stu.fullName || 'Unavailable Student',
      admissionNumber:
        typeof stu.admissionNumber === 'string' && stu.admissionNumber.trim() !== ''
          ? stu.admissionNumber.trim()
          : null,
      currentClassName: stu.currentClassName ?? null,
      attendanceClassName: stu.attendanceClassName ?? null,
      isActive: Boolean(stu.isActive),
      presentCount: Number(stu.presentCount) || 0,
      absentCount: Number(stu.absentCount) || 0,
      markedDays,
      attendancePercentage:
        markedDays === 0 || !Number.isFinite(stuPct) ? 0 : stuPct,
    };
  });

  const dailySummary = rawDaily
    .map((day) => {
      const hasSuppliedPct =
        day.attendancePercentage !== undefined &&
        day.attendancePercentage !== null &&
        Number.isFinite(Number(day.attendancePercentage));
      return {
        attendanceDate: day.attendanceDate || '',
        presentCount: Number(day.presentCount) || 0,
        absentCount: Number(day.absentCount) || 0,
        markedCount: Number(day.markedCount) || 0,
        attendancePercentage: hasSuppliedPct
          ? Number(day.attendancePercentage)
          : null,
      };
    })
    .filter((day) => Boolean(day.attendanceDate))
    .sort((a, b) => a.attendanceDate.localeCompare(b.attendanceDate));

  return {
    summary: {
      className: rawSummary.className || '',
      month: rawSummary.month || '',
      totalStudents: Number(rawSummary.totalStudents) || students.length,
      totalRecordedDays,
      presentCount,
      absentCount,
      markedCount,
      overallRecordedDayPercentage,
    },
    students,
    dailySummary,
  };
};

/**
 * Normalize the GET /api/admin/attendance/student/:studentId response.
 */
export const normalizeStudentHistoryResponse = (res) => {
  const rawData = res?.data;
  const rawStudent = rawData?.student;
  if (!rawStudent || typeof rawStudent !== 'object') {
    return null;
  }

  const rawHistory = Array.isArray(rawData.history) ? rawData.history : [];
  const rawSummary = rawData.summary || {};
  const markedDays = Number(rawSummary.markedDays) || 0;
  const rawPct = Number(rawSummary.attendancePercentage);

  return {
    student: {
      studentId: rawStudent.studentId || '',
      fullName: rawStudent.fullName || 'Unavailable Student',
      admissionNumber:
        typeof rawStudent.admissionNumber === 'string' &&
        rawStudent.admissionNumber.trim() !== ''
          ? rawStudent.admissionNumber.trim()
          : null,
      currentClassName: rawStudent.currentClassName ?? null,
      isActive: Boolean(rawStudent.isActive),
    },
    month: rawData.month || '',
    history: rawHistory.map((item) => ({
      _id: item._id || `${item.attendanceDate}-${item.className}`,
      attendanceDate: item.attendanceDate || '',
      className: item.className || '',
      status: item.status === 'Present' || item.status === 'Absent' ? item.status : '',
      markedBy: item.markedBy || null,
      updatedBy: item.updatedBy || null,
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
    })),
    summary: {
      presentCount: Number(rawSummary.presentCount) || 0,
      absentCount: Number(rawSummary.absentCount) || 0,
      markedDays,
      attendancePercentage:
        markedDays === 0 || !Number.isFinite(rawPct) ? 0 : rawPct,
    },
  };
};

/**
 * Validate monthly report filter inputs before issuing an API request.
 */
export const validateMonthlyReportQuery = (
  { className, month } = {},
  referenceDate = new Date()
) => {
  if (!isAttendanceClass(className)) {
    return 'Attendance reports are only supported for Class 8 and Class 9.';
  }
  if (!isValidAttendanceMonth(month, referenceDate)) {
    return 'Please select a valid non-future month (YYYY-MM).';
  }
  return '';
};

/**
 * Validate student history query inputs before issuing an API request.
 */
export const validateStudentHistoryQuery = (
  studentId,
  month,
  referenceDate = new Date()
) => {
  if (!isValidObjectId(studentId)) {
    return 'Invalid student identifier.';
  }
  if (!isValidAttendanceMonth(month, referenceDate)) {
    return 'Please select a valid non-future month (YYYY-MM).';
  }
  return '';
};

/**
 * Extract an actionable error message for monthly summary failures.
 */
export const getMonthlyReportErrorMessage = (err) => {
  const status = err?.response?.status;
  const apiMsg = err?.response?.data?.message;

  if (status === 400) {
    return apiMsg || 'Invalid class or month selection.';
  }
  if (status === 401 || status === 403) {
    return 'You are not authorized to view monthly attendance reports.';
  }
  return apiMsg || err?.message || 'Failed to load monthly attendance report. Please try again.';
};

/**
 * Extract an actionable error message for individual student history failures.
 */
export const getStudentHistoryErrorMessage = (err) => {
  const status = err?.response?.status;
  const apiMsg = err?.response?.data?.message;

  if (status === 400) {
    return apiMsg || 'Invalid student or month selection.';
  }
  if (status === 401 || status === 403) {
    return 'You are not authorized to view student attendance history.';
  }
  if (status === 404) {
    return apiMsg || 'Student record could not be found.';
  }
  return apiMsg || err?.message || 'Failed to load student attendance history. Please try again.';
};
