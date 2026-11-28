import { SCHOOL_DETAILS_FALLBACK } from '../config/fallbackData.js';

export const API_BASE_URL = '/api';

export const SCHOOL_DEFAULTS = SCHOOL_DETAILS_FALLBACK;

export const GALLERY_CATEGORIES = ['All', 'Campus', 'Facilities', 'Events', 'Sports', 'Academics', 'Celebrations'];

export const NOTICE_CATEGORIES = ['All', 'Academic', 'Exam', 'Holiday', 'General', 'Admission'];

export const ACADEMIC_RESOURCE_CATEGORIES = [
  'Book List',
  'Syllabus',
  'Academic Calendar',
  'Holiday Calendar',
  'Annual Calendar',
];

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

export const STUDENT_PHOTO_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export const STUDENT_PHOTO_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
