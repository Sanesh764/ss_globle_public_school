import {
  validateStudentRegistration,
  normalizeIndianContactNumber,
  normalizeRegistrationEmail,
} from './registrationValidator.js';

export const EDITABLE_STUDENT_FIELDS = [
  'fullName',
  'dateOfBirth',
  'gender',
  'fatherName',
  'motherName',
  'contactNumber',
  'className',
  'email',
];

export const formatStudentDateForInput = (dateValue) => {
  if (!dateValue) return '';
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim())) {
    return dateValue.trim();
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export const buildStudentEditFormValues = (student = {}) => ({
  fullName: student.fullName || '',
  dateOfBirth: formatStudentDateForInput(student.dateOfBirth),
  gender: student.gender || '',
  fatherName: student.fatherName || '',
  motherName: student.motherName || '',
  contactNumber: student.contactNumber || '',
  className: student.className || '',
  email: student.email || '',
});

export const validateAdminStudentEdit = (values = {}) => {
  const regErrors = validateStudentRegistration({
    fullName: values.fullName,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    fatherName: values.fatherName,
    motherName: values.motherName,
    contactNumber: values.contactNumber,
    classApplyingFor: values.className,
    email: values.email,
    photo: null,
  });

  if (regErrors.classApplyingFor) {
    regErrors.className = regErrors.classApplyingFor.replace(
      'Class applying for',
      'Class'
    );
    delete regErrors.classApplyingFor;
  }

  return regErrors;
};

const normalizeAllEditableValues = (values = {}) => {
  const rawContact = typeof values.contactNumber === 'string' ? values.contactNumber : '';
  const normalizedContact = normalizeIndianContactNumber(rawContact) || rawContact.trim();

  return {
    fullName: String(values.fullName || '').trim(),
    dateOfBirth: formatStudentDateForInput(values.dateOfBirth),
    gender: String(values.gender || '').trim(),
    fatherName: String(values.fatherName || '').trim(),
    motherName: String(values.motherName || '').trim(),
    contactNumber: normalizedContact,
    className: String(values.className || '').trim(),
    email: normalizeRegistrationEmail(values.email),
  };
};

export const buildAdminStudentUpdatePayload = (values = {}, initialStudent = null) => {
  const normalizedNext = normalizeAllEditableValues(values);

  if (!initialStudent) {
    return normalizedNext;
  }

  const normalizedInitial = normalizeAllEditableValues(
    buildStudentEditFormValues(initialStudent)
  );

  const partialPayload = {};
  for (const field of EDITABLE_STUDENT_FIELDS) {
    if (normalizedNext[field] !== normalizedInitial[field]) {
      partialPayload[field] = normalizedNext[field];
    }
  }

  return partialPayload;
};

export const hasUnsavedStudentEditChanges = (values = {}, student = {}) => {
  const initial = buildStudentEditFormValues(student);
  return EDITABLE_STUDENT_FIELDS.some(
    (key) => String(values[key] ?? '').trim() !== String(initial[key] ?? '').trim()
  );
};

export const getStudentEditErrorDetails = (err) => {
  const status = err?.response?.status;
  const apiMsg = err?.response?.data?.message;

  if (status === 400) {
    return {
      status,
      isConflict: false,
      isNotFound: false,
      message: apiMsg || 'Please check the entered student details and try again.',
    };
  }

  if (status === 401 || status === 403) {
    return {
      status,
      isConflict: false,
      isNotFound: false,
      message: 'You are not authorized to edit this student record.',
    };
  }

  if (status === 404) {
    return {
      status,
      isConflict: false,
      isNotFound: true,
      message: 'This student record no longer exists.',
    };
  }

  if (status === 409) {
    return {
      status,
      isConflict: true,
      isNotFound: false,
      message:
        apiMsg ||
        'A conflict occurred while updating this student record. Refreshing latest details.',
    };
  }

  return {
    status: status || 500,
    isConflict: false,
    isNotFound: false,
    message: apiMsg || 'Failed to save student changes. Please try again.',
  };
};
