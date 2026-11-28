export const ATTENDANCE_CLASS_OPTIONS = ['Class 8', 'Class 9'];
export const ATTENDANCE_STATUSES = ['Present', 'Absent'];
export const ATTENDANCE_TIMEZONE = 'Asia/Kolkata';
export const MAX_BULK_ATTENDANCE_ENTRIES = 500;

const DATE_KEY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_KEY_REGEX = /^(\d{4})-(\d{2})$/;
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const ALLOWED_ENTRY_KEYS = ['studentId', 'status'];

export const getTodayIndiaDateKey = (referenceDate = new Date()) => {
  const date = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid referenceDate');
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ATTENDANCE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const isAttendanceClass = (value) =>
  typeof value === 'string' && ATTENDANCE_CLASS_OPTIONS.includes(value.trim());

export const isValidObjectId = (value) =>
  typeof value === 'string' && OBJECT_ID_REGEX.test(value.trim());

export const isValidAttendanceDate = (value, referenceDate = new Date()) => {
  if (typeof value !== 'string') return false;
  const match = DATE_KEY_REGEX.exec(value);
  if (!match) return false;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const isRealCalendarDate =
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day;

  if (!isRealCalendarDate) return false;

  return value <= getTodayIndiaDateKey(referenceDate);
};

export const isValidAttendanceMonth = (value, referenceDate = new Date()) => {
  if (typeof value !== 'string') return false;
  const match = MONTH_KEY_REGEX.exec(value);
  if (!match) return false;

  const monthNum = Number.parseInt(match[2], 10);
  if (monthNum < 1 || monthNum > 12) return false;

  const currentIndiaMonth = getTodayIndiaDateKey(referenceDate).slice(0, 7);
  return value <= currentIndiaMonth;
};

export const validateAttendanceEntries = (entries) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('Attendance entries must be a non-empty array.');
  }

  if (entries.length > MAX_BULK_ATTENDANCE_ENTRIES) {
    throw new Error(
      `Too many attendance entries. Maximum allowed per submission is ${MAX_BULK_ATTENDANCE_ENTRIES}.`
    );
  }

  const seenStudentIds = new Set();
  const normalizedEntries = [];

  for (let idx = 0; idx < entries.length; idx += 1) {
    const entry = entries[idx];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`Attendance entry at index ${idx} must be an object.`);
    }

    for (const key of Object.keys(entry)) {
      if (!ALLOWED_ENTRY_KEYS.includes(key)) {
        throw new Error(`Unexpected field '${key}' in attendance entry ${idx}.`);
      }
    }

    if (!isValidObjectId(entry.studentId)) {
      throw new Error(`Invalid studentId at entry index ${idx}.`);
    }

    const sid = entry.studentId.trim();
    if (seenStudentIds.has(sid)) {
      throw new Error(`Duplicate studentId '${sid}' in attendance entries.`);
    }
    seenStudentIds.add(sid);

    if (typeof entry.status !== 'string' || !ATTENDANCE_STATUSES.includes(entry.status.trim())) {
      throw new Error(`Invalid attendance status at entry index ${idx}.`);
    }

    normalizedEntries.push({
      studentId: sid,
      status: entry.status.trim(),
    });
  }

  return normalizedEntries;
};

export const buildAttendanceBulkPayload = (
  { className, attendanceDate, entries } = {},
  referenceDate = new Date()
) => {
  if (!isAttendanceClass(className)) {
    throw new Error('Attendance is only supported for Class 8 and Class 9.');
  }
  if (!isValidAttendanceDate(attendanceDate, referenceDate)) {
    throw new Error(
      'Attendance date must be a valid YYYY-MM-DD calendar date and cannot be in the future.'
    );
  }

  return {
    className: className.trim(),
    attendanceDate,
    entries: validateAttendanceEntries(entries),
  };
};
