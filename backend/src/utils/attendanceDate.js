import { ATTENDANCE_TIMEZONE } from '../constants/attendanceConstants.js';

const ATTENDANCE_DATE_KEY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Returns the canonical YYYY-MM-DD date key in Asia/Kolkata timezone.
 * Accepts an optional referenceDate for deterministic testing.
 */
export const getTodayIndiaDateKey = (referenceDate = new Date()) => {
  const date = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid referenceDate passed to getTodayIndiaDateKey');
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ATTENDANCE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

/**
 * Validates that value is an exact YYYY-MM-DD string representing a real calendar date.
 * Rejects timestamps, whitespace-padded strings, and impossible dates (e.g. 2026-02-30).
 */
export const isValidAttendanceDateKey = (value) => {
  if (typeof value !== 'string') return false;
  const match = ATTENDANCE_DATE_KEY_REGEX.exec(value);
  if (!match) return false;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return (
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day
  );
};

/**
 * Checks whether a valid YYYY-MM-DD attendance date key is strictly after today in Asia/Kolkata.
 */
export const isFutureAttendanceDate = (value, referenceDate = new Date()) => {
  if (!isValidAttendanceDateKey(value)) {
    return false;
  }
  return value > getTodayIndiaDateKey(referenceDate);
};

/**
 * Structured validation helper for attendanceDate query/body inputs.
 * Distinguishes format errors, impossible calendar dates, and future IST dates.
 */
export const validateAttendanceDateKey = (value, referenceDate = new Date()) => {
  if (typeof value !== 'string' || !ATTENDANCE_DATE_KEY_REGEX.test(value)) {
    return {
      valid: false,
      reason: 'INVALID_FORMAT',
      message: 'Attendance date must be a string in YYYY-MM-DD format.',
    };
  }

  if (!isValidAttendanceDateKey(value)) {
    return {
      valid: false,
      reason: 'INVALID_CALENDAR_DATE',
      message: 'Attendance date must be a valid calendar date.',
    };
  }

  if (isFutureAttendanceDate(value, referenceDate)) {
    return {
      valid: false,
      reason: 'FUTURE_DATE',
      message: 'Attendance date cannot be in the future.',
    };
  }

  return {
    valid: true,
    reason: null,
    message: '',
  };
};
