import {
  validateStudentRegistration,
  normalizeIndianContactNumber,
  normalizeRegistrationEmail,
} from './registrationValidator.js';

export const EDITABLE_APPLICATION_STATUSES = ['Pending', 'Correction Requested'];
export const EDIT_NOTE_MAX_LENGTH = 500;

export const isApplicationEditable = (status) =>
  EDITABLE_APPLICATION_STATUSES.includes(status);

export const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim())) {
    return dateValue.trim();
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export const buildEditFormValues = (application = {}) => ({
  fullName: application.fullName || '',
  dateOfBirth: formatDateForInput(application.dateOfBirth),
  gender: application.gender || '',
  fatherName: application.fatherName || '',
  motherName: application.motherName || '',
  contactNumber: application.contactNumber || '',
  classApplyingFor: application.classApplyingFor || '',
  email: application.email || '',
  note: '',
});

export const validateAdminApplicationEdit = (values = {}) => {
  const errors = validateStudentRegistration({
    fullName: values.fullName,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    fatherName: values.fatherName,
    motherName: values.motherName,
    contactNumber: values.contactNumber,
    classApplyingFor: values.classApplyingFor,
    email: values.email,
    photo: null,
  });

  if (values.note !== undefined && values.note !== null && String(values.note).trim() !== '') {
    if (typeof values.note !== 'string') {
      errors.note = 'Internal edit note must be text';
    } else if (values.note.trim().length > EDIT_NOTE_MAX_LENGTH) {
      errors.note = `Internal edit note must not exceed ${EDIT_NOTE_MAX_LENGTH} characters`;
    }
  }

  return errors;
};

export const buildAdminApplicationUpdatePayload = (values = {}) => {
  const rawContact = typeof values.contactNumber === 'string' ? values.contactNumber : '';
  const normalizedContact = normalizeIndianContactNumber(rawContact) || rawContact.trim();

  const payload = {
    fullName: String(values.fullName || '').trim(),
    dateOfBirth: formatDateForInput(values.dateOfBirth),
    gender: String(values.gender || '').trim(),
    fatherName: String(values.fatherName || '').trim(),
    motherName: String(values.motherName || '').trim(),
    contactNumber: normalizedContact,
    classApplyingFor: String(values.classApplyingFor || '').trim(),
    email: normalizeRegistrationEmail(values.email),
  };

  if (typeof values.note === 'string' && values.note.trim() !== '') {
    payload.note = values.note.trim();
  }

  return payload;
};

export const hasUnsavedEditChanges = (values = {}, application = {}) => {
  const initial = buildEditFormValues(application);
  const fields = [
    'fullName',
    'dateOfBirth',
    'gender',
    'fatherName',
    'motherName',
    'contactNumber',
    'classApplyingFor',
    'email',
  ];

  const anyFieldChanged = fields.some(
    (key) => String(values[key] ?? '').trim() !== String(initial[key] ?? '').trim()
  );

  return anyFieldChanged || String(values.note ?? '').trim() !== '';
};
