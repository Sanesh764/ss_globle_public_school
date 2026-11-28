export const getStudentDetailErrorMessage = (err) => {
  const status = err?.response?.status;
  if (status === 400) {
    return err?.response?.data?.message || 'Invalid student ID.';
  }
  if (status === 401 || status === 403) {
    return 'You are not authorized to view this student record.';
  }
  if (status === 404) {
    return 'Student record was not found.';
  }
  return err?.response?.data?.message || 'Failed to load student details. Please try again.';
};

export const formatAdmittedBySummary = (admittedBy) => {
  if (!admittedBy || typeof admittedBy !== 'object') {
    return {
      hasMetadata: false,
      name: 'Not available',
      email: 'Not available',
      role: 'Not available',
    };
  }

  return {
    hasMetadata: Boolean(admittedBy.name || admittedBy.email || admittedBy.role),
    name: admittedBy.name?.trim() || 'Not available',
    email: admittedBy.email?.trim() || 'Not available',
    role: admittedBy.role?.trim() || 'Not available',
  };
};

export const normalizeStudentDetail = (res) => {
  const raw = res?.data?.student;
  if (!raw || typeof raw !== 'object') return null;

  return {
    _id: raw._id,
    fullName: raw.fullName || 'Not provided',
    dateOfBirth: raw.dateOfBirth || null,
    gender: raw.gender || 'Not provided',
    className: raw.className || 'Not provided',
    fatherName: raw.fatherName || 'Not provided',
    motherName: raw.motherName || 'Not provided',
    contactNumber: raw.contactNumber || '',
    email: typeof raw.email === 'string' && raw.email.trim() !== '' ? raw.email.trim() : null,
    photoUrl: typeof raw.photo?.url === 'string' ? raw.photo.url.trim() : '',
    admissionNumber:
      typeof raw.admissionNumber === 'string' && raw.admissionNumber.trim() !== ''
        ? raw.admissionNumber.trim()
        : null,
    applicationNumber:
      typeof raw.applicationNumber === 'string' && raw.applicationNumber.trim() !== ''
        ? raw.applicationNumber.trim()
        : null,
    isActive: Boolean(raw.isActive),
    admittedAt: raw.admittedAt || null,
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    admittedBy: formatAdmittedBySummary(raw.admittedBy),
  };
};
