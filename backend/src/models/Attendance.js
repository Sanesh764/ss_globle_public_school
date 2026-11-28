import mongoose from 'mongoose';
import {
  ATTENDANCE_CLASS_OPTIONS,
  ATTENDANCE_STATUSES,
} from '../constants/attendanceConstants.js';
import { isValidAttendanceDateKey } from '../utils/attendanceDate.js';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    className: {
      type: String,
      required: [true, 'Class selection is required'],
      enum: {
        values: ATTENDANCE_CLASS_OPTIONS,
        message: 'Attendance is only supported for Class 8 and Class 9',
      },
      trim: true,
    },
    attendanceDate: {
      type: String,
      required: [true, 'Attendance date is required'],
      validate: {
        validator: isValidAttendanceDateKey,
        message: 'Attendance date must be a valid calendar date in YYYY-MM-DD format',
      },
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ATTENDANCE_STATUSES,
        message: 'Attendance status must be Present or Absent',
      },
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Marking administrator reference is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

attendanceSchema.index({ studentId: 1, attendanceDate: 1 }, { unique: true });
attendanceSchema.index({ className: 1, attendanceDate: 1 });
attendanceSchema.index({ attendanceDate: 1, status: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
