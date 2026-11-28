import API from './api.js';
import {
  isAttendanceClass,
  isValidAttendanceDate,
  isValidAttendanceMonth,
  isValidObjectId,
  buildAttendanceBulkPayload,
} from '../utils/adminAttendanceUtils.js';

/**
 * Fetch the daily attendance sheet for Class 8 or Class 9 on a given IST YYYY-MM-DD date.
 */
export const getDailyAttendanceSheet = async ({ className, date } = {}) => {
  if (!isAttendanceClass(className)) {
    throw new Error('Attendance is only supported for Class 8 and Class 9.');
  }
  if (!isValidAttendanceDate(date)) {
    throw new Error(
      'Attendance date must be a valid YYYY-MM-DD calendar date and cannot be in the future.'
    );
  }

  const response = await API.get('/admin/attendance/sheet', {
    params: {
      className: className.trim(),
      date,
    },
  });
  return response.data;
};

/**
 * Submit or update bulk daily attendance for Class 8 or Class 9.
 */
export const submitBulkAttendance = async (payload = {}) => {
  const sanitizedPayload = buildAttendanceBulkPayload(payload);
  const response = await API.post('/admin/attendance/bulk', sanitizedPayload);
  return response.data;
};

/**
 * Fetch monthly attendance summary for Class 8 or Class 9 for a YYYY-MM month.
 */
export const getMonthlyAttendanceSummary = async ({ className, month } = {}) => {
  if (!isAttendanceClass(className)) {
    throw new Error('Attendance is only supported for Class 8 and Class 9.');
  }
  if (!isValidAttendanceMonth(month)) {
    throw new Error(
      'Month must be a valid YYYY-MM calendar month and cannot be in the future.'
    );
  }

  const response = await API.get('/admin/attendance/summary', {
    params: {
      className: className.trim(),
      month,
    },
  });
  return response.data;
};

/**
 * Fetch monthly attendance history for an individual permanent Student.
 */
export const getStudentAttendanceHistory = async (studentId, month) => {
  if (!isValidObjectId(studentId)) {
    throw new Error('Valid studentId is required.');
  }
  if (!isValidAttendanceMonth(month)) {
    throw new Error(
      'Month must be a valid YYYY-MM calendar month and cannot be in the future.'
    );
  }

  const response = await API.get(`/admin/attendance/student/${studentId.trim()}`, {
    params: { month },
  });
  return response.data;
};
