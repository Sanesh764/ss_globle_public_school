import API from './api.js';
import {
  normalizeIndianContactNumber,
  normalizeRegistrationEmail,
} from '../utils/registrationValidator.js';

const buildSanitizedRegistrationPayload = (values = {}) => {
  const rawContact = typeof values.contactNumber === 'string' ? values.contactNumber : '';
  const normalizedContact = normalizeIndianContactNumber(rawContact) || rawContact.trim();

  const payload = {
    fullName: String(values.fullName || '').trim(),
    dateOfBirth:
      values.dateOfBirth instanceof Date
        ? values.dateOfBirth.toISOString().slice(0, 10)
        : String(values.dateOfBirth || '').trim(),
    gender: String(values.gender || '').trim(),
    fatherName: String(values.fatherName || '').trim(),
    motherName: String(values.motherName || '').trim(),
    contactNumber: normalizedContact,
    classApplyingFor: String(values.classApplyingFor || '').trim(),
  };

  const normalizedEmail = normalizeRegistrationEmail(values.email);
  if (normalizedEmail) {
    payload.email = normalizedEmail;
  }

  return payload;
};

/**
 * Submits a public student registration application to POST /api/registrations.
 * Sends application/json when no photo is provided, or multipart/form-data when photoFile is present.
 *
 * @param {object} values Registration form fields
 * @param {File|Blob|null} [photoFile=null] Optional student photograph
 * @returns {Promise<object>} Backend ApiResponse payload
 */
export const submitStudentRegistration = async (values, photoFile = null) => {
  const payload = buildSanitizedRegistrationPayload(values);

  if (!photoFile) {
    const response = await API.post('/registrations', payload);
    return response.data;
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  }
  formData.append('photo', photoFile);

  // Unset default application/json Content-Type so the browser/Axios generates multipart/form-data with boundary
  const response = await API.post('/registrations', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });

  return response.data;
};

export default submitStudentRegistration;
