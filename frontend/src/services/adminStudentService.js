import API from './api.js';

const LIST_PARAM_KEYS = ['page', 'limit', 'search', 'className', 'isActive'];

const EDITABLE_STUDENT_KEYS = [
  'fullName',
  'dateOfBirth',
  'gender',
  'fatherName',
  'motherName',
  'contactNumber',
  'className',
  'email',
];

const sanitizeStudentListParams = (params = {}) => {
  const sanitized = {
    page: 1,
    limit: 15,
  };

  for (const key of LIST_PARAM_KEYS) {
    const rawValue = params[key];
    if (rawValue === undefined || rawValue === null) continue;

    if (key === 'isActive') {
      if (typeof rawValue === 'boolean') {
        sanitized.isActive = rawValue;
      } else if (typeof rawValue === 'string') {
        const trimmed = rawValue.trim();
        if (trimmed === 'true') {
          sanitized.isActive = true;
        } else if (trimmed === 'false') {
          sanitized.isActive = false;
        }
      }
      continue;
    }

    if (typeof rawValue === 'string') {
      const trimmed = rawValue.trim();
      if (!trimmed) continue;
      if (key === 'className' && trimmed === 'All') continue;
      sanitized[key] = trimmed;
    } else {
      sanitized[key] = rawValue;
    }
  }

  return sanitized;
};

const buildAllowedStudentUpdatePayload = (payload = {}) => {
  const sanitized = {};
  for (const key of EDITABLE_STUDENT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== undefined) {
      sanitized[key] = payload[key];
    }
  }
  return sanitized;
};

/**
 * Fetch paginated permanent students for Admin/Staff management.
 * Defaults page=1 and limit=15, omits empty/"All" filters, and preserves isActive: false.
 */
export const getAdminStudents = async (params = {}) => {
  const queryParams = sanitizeStudentListParams(params);
  const response = await API.get('/admin/students', { params: queryParams });
  return response.data;
};

/**
 * Fetch complete details of a single permanent student by ID.
 */
export const getAdminStudentById = async (id) => {
  const response = await API.get(`/admin/students/${id}`);
  return response.data;
};

/**
 * Update allowlisted editable fields of a permanent student record.
 */
export const updateAdminStudent = async (id, payload = {}) => {
  const sanitizedPayload = buildAllowedStudentUpdatePayload(payload);
  const response = await API.patch(`/admin/students/${id}`, sanitizedPayload);
  return response.data;
};

/**
 * Activate or deactivate a permanent student record without deleting it.
 * Rejects non-boolean isActive values before issuing a network request.
 */
export const updateAdminStudentStatus = async (id, isActive) => {
  if (typeof isActive !== 'boolean') {
    throw new TypeError('isActive must be a boolean (true or false).');
  }
  const response = await API.patch(`/admin/students/${id}/status`, { isActive });
  return response.data;
};
