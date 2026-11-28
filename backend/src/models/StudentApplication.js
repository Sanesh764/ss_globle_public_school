import mongoose from 'mongoose';

export const CLASS_OPTIONS = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export const APPLICATION_STATUSES = [
  'Pending',
  'Correction Requested',
  'Approved',
  'Rejected',
];

export const REVIEW_ACTOR_TYPES = ['Applicant', 'Admin', 'Staff', 'System'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIA_TIMEZONE = 'Asia/Kolkata';
const ALLOWED_CONTACT_CHARS_REGEX = /^[+\d\s()-]+$/;
const INDIAN_MOBILE_COMPACT_REGEX = /^(?:\+91)?([6-9]\d{9})$/;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;

export const normalizeIndianContactNumber = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || !ALLOWED_CONTACT_CHARS_REGEX.test(trimmed)) {
    return null;
  }
  const compact = trimmed.replace(/[\s()-]/g, '');
  const match = compact.match(INDIAN_MOBILE_COMPACT_REGEX);
  return match ? match[1] : null;
};

export const isValidIndianContactNumber = (value) =>
  normalizeIndianContactNumber(value) !== null;

const formatIndiaDateKey = (date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

export const isValidNonFutureIndiaDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return false;
  }
  return formatIndiaDateKey(date) <= formatIndiaDateKey(new Date());
};

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

const reviewHistoryEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Review history action is required'],
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    actorType: {
      type: String,
      required: [true, 'Actor type is required'],
      enum: {
        values: REVIEW_ACTOR_TYPES,
        message: 'Actor type must be Applicant, Admin, Staff, or System',
      },
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    changedFields: {
      type: [String],
      default: [],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const studentApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: [true, 'Application reference number is required'],
      trim: true,
    },
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
    classApplyingFor: {
      type: String,
      required: [true, 'Class selection is required'],
      enum: {
        values: CLASS_OPTIONS,
        message: 'Class applying for must be between Class 1 and Class 12',
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
    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUSES,
        message: 'Status must be Pending, Correction Requested, Approved, or Rejected',
      },
      default: 'Pending',
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: '',
    },
    correctionMessage: {
      type: String,
      trim: true,
      default: '',
    },
    approvedStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    reviewHistory: {
      type: [reviewHistoryEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

studentApplicationSchema.index({ applicationNumber: 1 }, { unique: true });
studentApplicationSchema.index({ status: 1, classApplyingFor: 1, createdAt: -1 });
studentApplicationSchema.index({ contactNumber: 1 });
studentApplicationSchema.index({ createdAt: -1 });

const StudentApplication = mongoose.model('StudentApplication', studentApplicationSchema);
export default StudentApplication;
