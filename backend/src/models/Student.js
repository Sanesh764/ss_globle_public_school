import mongoose from 'mongoose';
import {
  CLASS_OPTIONS,
  EMAIL_MAX_LENGTH,
  GENDER_OPTIONS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  isValidIndianContactNumber,
  isValidNonFutureIndiaDate,
  normalizeIndianContactNumber,
} from './StudentApplication.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const photoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      default: '',
    },
    public_id: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
      minlength: [NAME_MIN_LENGTH, `Student full name must be at least ${NAME_MIN_LENGTH} characters`],
      maxlength: [NAME_MAX_LENGTH, `Student full name must not exceed ${NAME_MAX_LENGTH} characters`],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: isValidNonFutureIndiaDate,
        message: 'Date of birth must be a valid date and cannot be in the future',
      },
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: GENDER_OPTIONS,
        message: 'Gender must be Male, Female, or Other',
      },
      trim: true,
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
      minlength: [NAME_MIN_LENGTH, `Father's name must be at least ${NAME_MIN_LENGTH} characters`],
      maxlength: [NAME_MAX_LENGTH, `Father's name must not exceed ${NAME_MAX_LENGTH} characters`],
    },
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
      minlength: [NAME_MIN_LENGTH, `Mother's name must be at least ${NAME_MIN_LENGTH} characters`],
      maxlength: [NAME_MAX_LENGTH, `Mother's name must not exceed ${NAME_MAX_LENGTH} characters`],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      set: (value) => {
        if (typeof value !== 'string') return value;
        return normalizeIndianContactNumber(value) ?? value.trim();
      },
      validate: {
        validator: function (value) {
          return typeof value === 'string' && isValidIndianContactNumber(value);
        },
        message: 'Please provide a valid 10-digit Indian mobile number (with optional +91)',
      },
    },
    className: {
      type: String,
      required: [true, 'Class selection is required'],
      enum: {
        values: CLASS_OPTIONS,
        message: 'Class must be between Class 1 and Class 12',
      },
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [EMAIL_MAX_LENGTH, `Email address must not exceed ${EMAIL_MAX_LENGTH} characters`],
      default: undefined,
      validate: {
        validator: function (value) {
          if (value === undefined || value === null || value === '') {
            return true;
          }
          return EMAIL_REGEX.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
    photo: {
      type: photoSchema,
      default: () => ({ url: '', public_id: '' }),
    },
    admissionNumber: {
      type: String,
      trim: true,
      default: undefined,
    },
    sourceApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentApplication',
      required: [true, 'Source application reference is required'],
    },
    applicationNumber: {
      type: String,
      trim: true,
      default: undefined,
    },
    admittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admitting administrator reference is required'],
    },
    admittedAt: {
      type: Date,
      required: [true, 'Admission timestamp is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

studentSchema.index({ sourceApplicationId: 1 }, { unique: true });
studentSchema.index({ admissionNumber: 1 }, { unique: true, sparse: true });
studentSchema.index({ className: 1, isActive: 1 });
studentSchema.index({ contactNumber: 1 });

const Student = mongoose.model('Student', studentSchema);
export default Student;
