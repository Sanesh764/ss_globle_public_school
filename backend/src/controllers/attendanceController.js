import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import {
  ATTENDANCE_CLASS_OPTIONS,
  ATTENDANCE_STATUSES,
} from '../constants/attendanceConstants.js';
import {
  getTodayIndiaDateKey,
  validateAttendanceDateKey,
} from '../utils/attendanceDate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';

export const MAX_BULK_ATTENDANCE_ENTRIES = 500;
const ALLOWED_BULK_BODY_KEYS = ['className', 'attendanceDate', 'entries'];
const ALLOWED_BULK_ENTRY_KEYS = ['studentId', 'status'];
const ALLOWED_SUMMARY_QUERY_KEYS = ['className', 'month'];
const ALLOWED_HISTORY_QUERY_KEYS = ['month'];
const MONTH_KEY_REGEX = /^(\d{4})-(\d{2})$/;

const STUDENT_ROSTER_PROJECTION = {
  _id: 1,
  fullName: 1,
  admissionNumber: 1,
  className: 1,
  'photo.url': 1,
  isActive: 1,
};

const ATTENDANCE_SHEET_PROJECTION = {
  _id: 1,
  studentId: 1,
  className: 1,
  attendanceDate: 1,
  status: 1,
  markedBy: 1,
  updatedBy: 1,
  createdAt: 1,
  updatedAt: 1,
};

const ALLOWED_SHEET_QUERY_KEYS = ['className', 'date'];

const formatSafeAdmin = (admin) => {
  if (!admin || typeof admin !== 'object') return null;
  return {
    name: admin.name ?? null,
    email: admin.email ?? null,
    role: admin.role ?? null,
  };
};

const validateSheetQueryParams = (query = {}) => {
  const keys = Object.keys(query);
  for (const key of keys) {
    if (!ALLOWED_SHEET_QUERY_KEYS.includes(key)) {
      throw new ApiError(400, `Unexpected query parameter '${key}'.`);
    }
  }

  const rawClassName = query.className;
  if (typeof rawClassName !== 'string' || !rawClassName.trim()) {
    throw new ApiError(400, 'className query parameter is required.');
  }
  const className = rawClassName.trim();
  if (!ATTENDANCE_CLASS_OPTIONS.includes(className)) {
    throw new ApiError(
      400,
      'Invalid className. Attendance is only supported for Class 8 and Class 9.'
    );
  }

  const rawDate = query.date;
  if (typeof rawDate !== 'string' || rawDate === '') {
    throw new ApiError(400, 'date query parameter is required in YYYY-MM-DD format.');
  }
  const dateValidation = validateAttendanceDateKey(rawDate);
  if (!dateValidation.valid) {
    throw new ApiError(400, dateValidation.message);
  }

  return { className, attendanceDate: rawDate };
};

/**
 * @desc    Fetch read-only daily attendance sheet for Class 8 or Class 9 on a given IST date
 * @route   GET /api/admin/attendance/sheet?className=Class%208&date=YYYY-MM-DD
 * @access  Private (superadmin, admin, staff)
 */
export const getDailyAttendanceSheet = asyncHandler(async (req, res) => {
  const { className, attendanceDate } = validateSheetQueryParams(req.query);

  const [activeStudents, existingAttendance] = await Promise.all([
    Student.find({ className, isActive: true }, STUDENT_ROSTER_PROJECTION)
      .sort({ fullName: 1, _id: 1 })
      .lean(),
    Attendance.find({ className, attendanceDate }, ATTENDANCE_SHEET_PROJECTION)
      .populate('studentId', '_id fullName admissionNumber className photo.url isActive')
      .populate('markedBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .lean(),
  ]);

  const activeStudentIds = activeStudents.map((s) => s._id);
  const crossClassConflicts =
    activeStudentIds.length > 0
      ? await Attendance.find(
          {
            studentId: { $in: activeStudentIds },
            attendanceDate,
            className: { $ne: className },
          },
          ATTENDANCE_SHEET_PROJECTION
        )
          .populate('markedBy', 'name email role')
          .populate('updatedBy', 'name email role')
          .lean()
      : [];

  const conflictMap = new Map();
  for (const conflict of crossClassConflicts) {
    const sid = String(conflict.studentId);
    if (!conflictMap.has(sid)) {
      conflictMap.set(sid, {
        attendanceId: conflict._id,
        className: conflict.className,
        status: conflict.status,
        message: `Already marked ${conflict.status} in ${conflict.className} for ${attendanceDate}`,
      });
    }
  }

  const rowMap = new Map();

  for (const record of existingAttendance) {
    const populatedStudent =
      record.studentId && typeof record.studentId === 'object' ? record.studentId : null;
    const sid = populatedStudent
      ? String(populatedStudent._id)
      : record.studentId
        ? String(record.studentId)
        : `unavailable:${record._id}`;

    if (rowMap.has(sid)) continue;

    rowMap.set(sid, {
      studentId: sid,
      fullName: populatedStudent ? populatedStudent.fullName : 'Unavailable Student',
      admissionNumber: populatedStudent ? populatedStudent.admissionNumber ?? null : null,
      photo: {
        url: populatedStudent?.photo?.url || '',
      },
      isActive: populatedStudent ? Boolean(populatedStudent.isActive) : false,
      currentClassName: populatedStudent ? populatedStudent.className || null : null,
      attendanceClassName: record.className,
      studentUnavailable: !populatedStudent,
      status: record.status,
      isMarked: true,
      crossClassConflict: null,
      attendance: {
        _id: record._id,
        className: record.className,
        attendanceDate: record.attendanceDate,
        markedBy: formatSafeAdmin(record.markedBy),
        updatedBy: formatSafeAdmin(record.updatedBy),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
    });
  }

  for (const student of activeStudents) {
    const sid = String(student._id);
    if (rowMap.has(sid)) continue;

    rowMap.set(sid, {
      studentId: sid,
      fullName: student.fullName,
      admissionNumber: student.admissionNumber ?? null,
      photo: {
        url: student.photo?.url || '',
      },
      isActive: true,
      currentClassName: student.className,
      attendanceClassName: null,
      studentUnavailable: false,
      status: null,
      isMarked: false,
      crossClassConflict: conflictMap.get(sid) || null,
      attendance: null,
    });
  }

  const students = Array.from(rowMap.values()).sort((a, b) => {
    const nameCmp = String(a.fullName).localeCompare(String(b.fullName), 'en', {
      sensitivity: 'base',
    });
    if (nameCmp !== 0) return nameCmp;
    return String(a.studentId).localeCompare(String(b.studentId));
  });

  let presentCount = 0;
  let absentCount = 0;
  let unmarkedCount = 0;
  let crossClassConflictCount = 0;

  for (const row of students) {
    if (row.status === 'Present') {
      presentCount += 1;
    } else if (row.status === 'Absent') {
      absentCount += 1;
    } else {
      unmarkedCount += 1;
    }
    if (row.crossClassConflict) {
      crossClassConflictCount += 1;
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sheet: {
          className,
          attendanceDate,
          students,
          summary: {
            totalStudents: students.length,
            presentCount,
            absentCount,
            unmarkedCount,
            markedCount: presentCount + absentCount,
            crossClassConflictCount,
          },
        },
      },
      'Daily attendance sheet fetched successfully.'
    )
  );
});

const validateBulkAttendanceBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Invalid bulk attendance payload.');
  }

  for (const key of Object.keys(body)) {
    if (key.startsWith('$') || key.includes('.')) {
      throw new ApiError(400, `Invalid operator or field key '${key}' in attendance payload.`);
    }
    if (!ALLOWED_BULK_BODY_KEYS.includes(key)) {
      throw new ApiError(400, `Unexpected field '${key}' in bulk attendance request.`);
    }
  }

  if (typeof body.className !== 'string' || !body.className.trim()) {
    throw new ApiError(400, 'className is required.');
  }
  const className = body.className.trim();
  if (!ATTENDANCE_CLASS_OPTIONS.includes(className)) {
    throw new ApiError(
      400,
      'Invalid className. Attendance is only supported for Class 8 and Class 9.'
    );
  }

  if (typeof body.attendanceDate !== 'string' || body.attendanceDate === '') {
    throw new ApiError(400, 'attendanceDate is required in YYYY-MM-DD format.');
  }
  const dateValidation = validateAttendanceDateKey(body.attendanceDate);
  if (!dateValidation.valid) {
    throw new ApiError(400, dateValidation.message);
  }
  const attendanceDate = body.attendanceDate;

  if (!Array.isArray(body.entries) || body.entries.length === 0) {
    throw new ApiError(400, 'entries must be a non-empty array of student attendance records.');
  }
  if (body.entries.length > MAX_BULK_ATTENDANCE_ENTRIES) {
    throw new ApiError(
      400,
      `Too many attendance entries. Maximum allowed per submission is ${MAX_BULK_ATTENDANCE_ENTRIES}.`
    );
  }

  const seenStudentIds = new Set();
  const normalizedEntries = [];

  for (let idx = 0; idx < body.entries.length; idx += 1) {
    const entry = body.entries[idx];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new ApiError(400, `Attendance entry at index ${idx} must be an object.`);
    }

    for (const key of Object.keys(entry)) {
      if (key.startsWith('$') || key.includes('.')) {
        throw new ApiError(400, `Invalid operator or field key '${key}' in entry ${idx}.`);
      }
      if (!ALLOWED_BULK_ENTRY_KEYS.includes(key)) {
        throw new ApiError(400, `Unexpected field '${key}' in attendance entry ${idx}.`);
      }
    }

    if (typeof entry.studentId !== 'string' || !mongoose.Types.ObjectId.isValid(entry.studentId)) {
      throw new ApiError(400, `Invalid studentId at entry index ${idx}.`);
    }

    const sid = entry.studentId;
    if (seenStudentIds.has(sid)) {
      throw new ApiError(400, `Duplicate studentId '${sid}' in attendance submission.`);
    }
    seenStudentIds.add(sid);

    if (
      typeof entry.status !== 'string' ||
      !ATTENDANCE_STATUSES.includes(entry.status.trim())
    ) {
      throw new ApiError(
        400,
        `Invalid status at entry index ${idx}. Allowed values: Present, Absent.`
      );
    }

    normalizedEntries.push({
      studentId: sid,
      status: entry.status.trim(),
    });
  }

  return {
    className,
    attendanceDate,
    entries: normalizedEntries,
    submittedIdsSet: seenStudentIds,
  };
};

/**
 * @desc    Submit or update bulk daily attendance for Class 8 or Class 9 inside a transaction
 * @route   POST /api/admin/attendance/bulk
 * @access  Private (superadmin, admin, staff)
 */
export const submitBulkAttendance = asyncHandler(async (req, res) => {
  const { className, attendanceDate, entries, submittedIdsSet } =
    validateBulkAttendanceBody(req.body);
  const submittedStudentIds = entries.map((e) => e.studentId);

  const session = await mongoose.startSession();
  let createdCount = 0;
  let updatedCount = 0;
  let presentCount = 0;
  let absentCount = 0;

  try {
    session.startTransaction();

    // Execute all session-bound queries sequentially; MongoDB replica-set
    // transactions do not support parallel operations on the same session.
    const activeRoster = await Student.find(
      { className, isActive: true },
      { _id: 1, className: 1 }
    )
      .session(session)
      .lean();

    const existingClassAttendance = await Attendance.find(
      { className, attendanceDate },
      { _id: 1, studentId: 1, className: 1, status: 1, markedBy: 1 }
    )
      .session(session)
      .lean();

    const submittedStudents = await Student.find(
      { _id: { $in: submittedStudentIds } },
      { _id: 1, className: 1, isActive: 1 }
    )
      .session(session)
      .lean();

    const otherClassAttendance = await Attendance.find(
      {
        studentId: { $in: submittedStudentIds },
        attendanceDate,
        className: { $ne: className },
      },
      { _id: 1, studentId: 1, className: 1, status: 1 }
    )
      .session(session)
      .lean();

    if (activeRoster.length === 0 && existingClassAttendance.length === 0) {
      throw new ApiError(
        400,
        `No active students found in ${className}. Cannot submit attendance for an empty class.`
      );
    }

    const existingClassMap = new Map(
      existingClassAttendance.map((rec) => [String(rec.studentId), rec])
    );
    const studentMap = new Map(submittedStudents.map((s) => [String(s._id), s]));

    for (const sid of submittedStudentIds) {
      if (!studentMap.has(sid) && !existingClassMap.has(sid)) {
        throw new ApiError(404, `Student with ID '${sid}' does not exist.`);
      }
    }

    if (otherClassAttendance.length > 0) {
      const conflict = otherClassAttendance[0];
      throw new ApiError(
        409,
        `Student '${conflict.studentId}' already has a ${conflict.status} attendance record in ${conflict.className} for ${attendanceDate}. Reload the sheet.`
      );
    }

    const missingActive = activeRoster.filter((s) => !submittedIdsSet.has(String(s._id)));
    if (missingActive.length > 0) {
      throw new ApiError(
        409,
        `Attendance roster changed or submission is incomplete: ${missingActive.length} active student(s) in ${className} are missing. Please reload the attendance sheet.`
      );
    }

    const bulkOps = [];

    for (const entry of entries) {
      const sid = entry.studentId;
      const existingRec = existingClassMap.get(sid);

      if (!existingRec) {
        const studentDoc = studentMap.get(sid);
        if (!studentDoc) {
          throw new ApiError(404, `Student with ID '${sid}' does not exist.`);
        }
        if (studentDoc.className !== className) {
          throw new ApiError(
            409,
            `Student '${sid}' currently belongs to ${studentDoc.className}, not ${className}. Please reload the attendance sheet.`
          );
        }
        if (!studentDoc.isActive) {
          throw new ApiError(
            409,
            `Student '${sid}' is inactive and has no existing attendance record for ${attendanceDate}. Please reload the attendance sheet.`
          );
        }

        createdCount += 1;
        bulkOps.push({
          insertOne: {
            document: {
              studentId: sid,
              className,
              attendanceDate,
              status: entry.status,
              markedBy: req.admin._id,
              updatedBy: null,
            },
          },
        });
      } else {
        updatedCount += 1;
        bulkOps.push({
          updateOne: {
            filter: { _id: existingRec._id },
            update: {
              $set: {
                status: entry.status,
                updatedBy: req.admin._id,
              },
            },
          },
        });
      }

      if (entry.status === 'Present') {
        presentCount += 1;
      } else {
        absentCount += 1;
      }
    }

    try {
      await Attendance.bulkWrite(bulkOps, { ordered: true, session });
    } catch (err) {
      const isDuplicateKey =
        err?.code === 11000 ||
        (Array.isArray(err?.writeErrors) && err.writeErrors.some((w) => w.code === 11000));
      if (isDuplicateKey) {
        throw new ApiError(
          409,
          'Duplicate attendance record conflict detected. Please reload the attendance sheet.'
        );
      }
      throw err;
    }

    await session.commitTransaction();
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch {
      // Ignore abort errors if transaction was not active
    }

    if (!(err instanceof ApiError)) {
      logger.error('[Attendance Bulk Transaction Error]', {
        name: err?.name || 'Error',
        code: err?.code ?? null,
        codeName: err?.codeName || null,
        message: err?.message || 'Unexpected transaction error',
      });
      throw new ApiError(
        500,
        'Unable to save attendance due to a database transaction error. Please try again.'
      );
    }

    throw err;
  } finally {
    await session.endSession();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          className,
          attendanceDate,
          totalStudents: entries.length,
          presentCount,
          absentCount,
          markedCount: presentCount + absentCount,
          createdCount,
          updatedCount,
        },
      },
      'Attendance saved successfully.'
    )
  );
});

const calculateRecordedPercentage = (presentCount, markedDays) => {
  if (!markedDays || markedDays <= 0) return 0;
  return Math.round((presentCount / markedDays) * 10000) / 100;
};

const validateAndGetMonthRange = (rawMonth) => {
  if (typeof rawMonth !== 'string' || rawMonth === '') {
    throw new ApiError(400, 'month query parameter is required in YYYY-MM format.');
  }

  const match = MONTH_KEY_REGEX.exec(rawMonth);
  if (!match) {
    throw new ApiError(400, 'month must be a string in YYYY-MM format.');
  }

  const year = Number.parseInt(match[1], 10);
  const monthNum = Number.parseInt(match[2], 10);
  if (monthNum < 1 || monthNum > 12) {
    throw new ApiError(400, 'Invalid month value. Month must be between 01 and 12.');
  }

  const currentIndiaMonth = getTodayIndiaDateKey().slice(0, 7);
  if (rawMonth > currentIndiaMonth) {
    throw new ApiError(400, 'Future months are not allowed for attendance reports.');
  }

  const lastDay = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
  return {
    month: rawMonth,
    startDate: `${rawMonth}-01`,
    endDate: `${rawMonth}-${String(lastDay).padStart(2, '0')}`,
  };
};

/**
 * @desc    Fetch monthly class attendance summary and per-student/per-day breakdown
 * @route   GET /api/admin/attendance/summary?className=Class%208&month=YYYY-MM
 * @access  Private (superadmin, admin, staff)
 */
export const getMonthlyAttendanceSummary = asyncHandler(async (req, res) => {
  for (const key of Object.keys(req.query || {})) {
    if (!ALLOWED_SUMMARY_QUERY_KEYS.includes(key)) {
      throw new ApiError(400, `Unexpected query parameter '${key}'.`);
    }
  }

  const rawClassName = req.query.className;
  if (typeof rawClassName !== 'string' || !rawClassName.trim()) {
    throw new ApiError(400, 'className query parameter is required.');
  }
  const className = rawClassName.trim();
  if (!ATTENDANCE_CLASS_OPTIONS.includes(className)) {
    throw new ApiError(
      400,
      'Invalid className. Attendance is only supported for Class 8 and Class 9.'
    );
  }

  const { month, startDate, endDate } = validateAndGetMonthRange(req.query.month);

  const [records, activeStudents] = await Promise.all([
    Attendance.find(
      {
        className,
        attendanceDate: { $gte: startDate, $lte: endDate },
      },
      { _id: 1, studentId: 1, className: 1, attendanceDate: 1, status: 1 }
    ).lean(),
    Student.find(
      { className, isActive: true },
      { _id: 1, fullName: 1, admissionNumber: 1, className: 1, isActive: 1 }
    ).lean(),
  ]);

  const studentInfoMap = new Map(activeStudents.map((s) => [String(s._id), s]));
  const historicalOnlyIds = [];
  const seenHistorical = new Set();

  for (const rec of records) {
    const sid = String(rec.studentId);
    if (!studentInfoMap.has(sid) && !seenHistorical.has(sid)) {
      seenHistorical.add(sid);
      historicalOnlyIds.push(rec.studentId);
    }
  }

  if (historicalOnlyIds.length > 0) {
    const historicalStudents = await Student.find(
      { _id: { $in: historicalOnlyIds } },
      { _id: 1, fullName: 1, admissionNumber: 1, className: 1, isActive: 1 }
    ).lean();
    for (const stu of historicalStudents) {
      studentInfoMap.set(String(stu._id), stu);
    }
  }

  const studentStatsMap = new Map();
  for (const stu of activeStudents) {
    const sid = String(stu._id);
    studentStatsMap.set(sid, {
      studentId: sid,
      fullName: stu.fullName,
      admissionNumber: stu.admissionNumber ?? null,
      currentClassName: stu.className,
      attendanceClassName: className,
      isActive: true,
      presentCount: 0,
      absentCount: 0,
      markedDays: 0,
      attendancePercentage: 0,
    });
  }

  const dailyStatsMap = new Map();
  let totalPresentCount = 0;
  let totalAbsentCount = 0;

  for (const rec of records) {
    const sid = String(rec.studentId);
    if (!studentStatsMap.has(sid)) {
      const info = studentInfoMap.get(sid);
      studentStatsMap.set(sid, {
        studentId: sid,
        fullName: info ? info.fullName : 'Unavailable Student',
        admissionNumber: info ? info.admissionNumber ?? null : null,
        currentClassName: info ? info.className : null,
        attendanceClassName: rec.className,
        isActive: info ? Boolean(info.isActive) : false,
        presentCount: 0,
        absentCount: 0,
        markedDays: 0,
        attendancePercentage: 0,
      });
    }

    const stuStat = studentStatsMap.get(sid);
    stuStat.markedDays += 1;

    if (!dailyStatsMap.has(rec.attendanceDate)) {
      dailyStatsMap.set(rec.attendanceDate, {
        attendanceDate: rec.attendanceDate,
        presentCount: 0,
        absentCount: 0,
        markedCount: 0,
      });
    }
    const dayStat = dailyStatsMap.get(rec.attendanceDate);
    dayStat.markedCount += 1;

    if (rec.status === 'Present') {
      stuStat.presentCount += 1;
      dayStat.presentCount += 1;
      totalPresentCount += 1;
    } else if (rec.status === 'Absent') {
      stuStat.absentCount += 1;
      dayStat.absentCount += 1;
      totalAbsentCount += 1;
    }
  }

  const students = Array.from(studentStatsMap.values())
    .map((stat) => ({
      ...stat,
      attendancePercentage: calculateRecordedPercentage(stat.presentCount, stat.markedDays),
    }))
    .sort((a, b) => {
      const nameCmp = String(a.fullName).localeCompare(String(b.fullName), 'en', {
        sensitivity: 'base',
      });
      if (nameCmp !== 0) return nameCmp;
      return String(a.studentId).localeCompare(String(b.studentId));
    });

  const dailySummary = Array.from(dailyStatsMap.values()).sort((a, b) =>
    a.attendanceDate.localeCompare(b.attendanceDate)
  );

  const markedCount = totalPresentCount + totalAbsentCount;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          className,
          month,
          totalStudents: students.length,
          totalRecordedDays: dailySummary.length,
          presentCount: totalPresentCount,
          absentCount: totalAbsentCount,
          markedCount,
          overallRecordedDayPercentage: calculateRecordedPercentage(
            totalPresentCount,
            markedCount
          ),
        },
        students,
        dailySummary,
      },
      'Monthly attendance summary fetched successfully.'
    )
  );
});

/**
 * @desc    Fetch monthly attendance history for an individual permanent Student
 * @route   GET /api/admin/attendance/student/:studentId?month=YYYY-MM
 * @access  Private (superadmin, admin, staff)
 */
export const getStudentAttendanceHistory = asyncHandler(async (req, res) => {
  for (const key of Object.keys(req.query || {})) {
    if (!ALLOWED_HISTORY_QUERY_KEYS.includes(key)) {
      throw new ApiError(400, `Unexpected query parameter '${key}'.`);
    }
  }

  const { month, startDate, endDate } = validateAndGetMonthRange(req.query.month);

  const student = await Student.findById(req.params.studentId, {
    _id: 1,
    fullName: 1,
    admissionNumber: 1,
    className: 1,
    isActive: 1,
  }).lean();

  if (!student) {
    throw new ApiError(404, 'Student not found.');
  }

  const records = await Attendance.find(
    {
      studentId: student._id,
      attendanceDate: { $gte: startDate, $lte: endDate },
    },
    {
      _id: 1,
      studentId: 1,
      className: 1,
      attendanceDate: 1,
      status: 1,
      markedBy: 1,
      updatedBy: 1,
      createdAt: 1,
      updatedAt: 1,
    }
  )
    .sort({ attendanceDate: -1 })
    .populate('markedBy', 'name email role')
    .populate('updatedBy', 'name email role')
    .lean();

  let presentCount = 0;
  let absentCount = 0;

  const history = records.map((rec) => {
    if (rec.status === 'Present') {
      presentCount += 1;
    } else if (rec.status === 'Absent') {
      absentCount += 1;
    }

    return {
      _id: rec._id,
      attendanceDate: rec.attendanceDate,
      className: rec.className,
      status: rec.status,
      markedBy: formatSafeAdmin(rec.markedBy),
      updatedBy: formatSafeAdmin(rec.updatedBy),
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
    };
  });

  const markedDays = history.length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        student: {
          studentId: String(student._id),
          fullName: student.fullName,
          admissionNumber: student.admissionNumber ?? null,
          currentClassName: student.className,
          isActive: Boolean(student.isActive),
        },
        month,
        history,
        summary: {
          presentCount,
          absentCount,
          markedDays,
          attendancePercentage: calculateRecordedPercentage(presentCount, markedDays),
        },
      },
      'Student attendance history fetched successfully.'
    )
  );
});
