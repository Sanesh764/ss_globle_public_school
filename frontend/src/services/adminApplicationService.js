import API from './api.js';

const LIST_PARAM_KEYS = ['page', 'limit', 'search', 'status', 'classApplyingFor'];

const EDITABLE_PAYLOAD_KEYS = [
  'fullName',
  'dateOfBirth',
  'gender',
  'fatherName',
  'motherName',
  'contactNumber',
  'classApplyingFor',
  'email',
  'note',
];

const sanitizeListParams = (params = {}) => {
  const sanitized = {};

  for (const key of LIST_PARAM_KEYS) {
    const rawValue = params[key];
    if (rawValue === undefined || rawValue === null) continue;

    if (typeof rawValue === 'string') {
      const trimmed = rawValue.trim();
      if (!trimmed) continue;
      if ((key === 'status' || key === 'classApplyingFor') && trimmed === 'All') {
        continue;
      }
      sanitized[key] = trimmed;
    } else {
      sanitized[key] = rawValue;
    }
  }

  return sanitized;
};

const buildAllowedUpdatePayload = (payload = {}) => {
  const sanitized = {};
  for (const key of EDITABLE_PAYLOAD_KEYS) {
    if (Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== undefined) {
      sanitized[key] = payload[key];
    }
  }
  return sanitized;
};

/**
 * Fetch paginated student applications for Admin/Staff review.
 * Omits undefined, null, empty, and "All" filter values.
 */
export const getAdminApplications = async (params = {}) => {
  const queryParams = sanitizeListParams(params);
  const config = Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined;
  const response = await API.get('/admin/applications', config);
  return response.data;
};

/**
 * Fetch full details and review history for a single student application.
 */
export const getAdminApplicationById = async (id) => {
  const response = await API.get(`/admin/applications/${id}`);
  return response.data;
};

/**
 * Partially or fully edit a Pending or Correction Requested application.
 */
export const updateAdminApplication = async (id, payload = {}) => {
  const sanitizedPayload = buildAllowedUpdatePayload(payload);
  const response = await API.patch(`/admin/applications/${id}`, sanitizedPayload);
  return response.data;
};

/**
 * Approve an application and atomically create a permanent Student record.
 */
export const approveAdminApplication = async (id, payload = {}) => {
  const body = {};
  if (payload && typeof payload.note === 'string' && payload.note.trim() !== '') {
    body.note = payload.note.trim();
  }
  const response = await API.patch(`/admin/applications/${id}/approve`, body);
  return response.data;
};

/**
 * Request corrections on a Pending or Correction Requested application.
 */
export const requestAdminApplicationCorrection = async (id, correctionMessage) => {
  const cleanMessage =
    typeof correctionMessage === 'string' ? correctionMessage.trim() : correctionMessage;
  const response = await API.patch(`/admin/applications/${id}/request-correction`, {
    correctionMessage: cleanMessage,
  });
  return response.data;
};

/**
 * Reject a Pending or Correction Requested application with a reason.
 */
export const rejectAdminApplication = async (id, rejectionReason) => {
  const cleanReason =
    typeof rejectionReason === 'string' ? rejectionReason.trim() : rejectionReason;
  const response = await API.patch(`/admin/applications/${id}/reject`, {
    rejectionReason: cleanReason,
  });
  return response.data;
};
