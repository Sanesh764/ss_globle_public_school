export const DEFAULT_STUDENT_PAGE_SIZE = 15;

export const STUDENT_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Students' },
  { value: 'active', label: 'Active Students' },
  { value: 'inactive', label: 'Inactive Students' },
];

export const buildStudentListQueryParams = ({
  page = 1,
  limit = DEFAULT_STUDENT_PAGE_SIZE,
  search = '',
  className = 'All',
  statusFilter = 'all',
} = {}) => {
  const params = {
    page: page || 1,
    limit: limit || DEFAULT_STUDENT_PAGE_SIZE,
  };

  if (typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
  }

  if (typeof className === 'string' && className.trim() !== '' && className !== 'All') {
    params.className = className.trim();
  }

  if (statusFilter === 'active') {
    params.isActive = true;
  } else if (statusFilter === 'inactive') {
    params.isActive = false;
  }

  return params;
};

export const normalizeStudentListResponse = (res, fallbackPage = 1) => {
  const students = Array.isArray(res?.data?.students) ? res.data.students : [];
  const rawPagination = res?.data?.pagination || {};

  return {
    students,
    pagination: {
      totalRecords: Number(rawPagination.totalRecords) || 0,
      currentPage: Number(rawPagination.currentPage) || fallbackPage,
      pageSize: Number(rawPagination.pageSize) || DEFAULT_STUDENT_PAGE_SIZE,
      totalPages: Number(rawPagination.totalPages) || 0,
    },
  };
};

export const getStudentStatusSummaryLabel = (statusFilter = 'all', className = 'All') => {
  const statusOpt =
    STUDENT_STATUS_FILTER_OPTIONS.find((opt) => opt.value === statusFilter) ||
    STUDENT_STATUS_FILTER_OPTIONS[0];
  const classLabel = className && className !== 'All' ? className : 'All Classes';
  return `${statusOpt.label} • ${classLabel}`;
};

export const getStudentListErrorMessage = (err) => {
  const status = err?.response?.status;
  if (status === 401 || status === 403) {
    return 'You are not authorized to view student records.';
  }
  return err?.response?.data?.message || 'Failed to load students. Please try again.';
};

export const getSafeBoundedPage = (currentPage, totalPages) => {
  const safePage = Number(currentPage) || 1;
  const safeTotalPages = Number(totalPages) || 0;
  if (safePage > 1 && safePage > safeTotalPages) {
    return Math.max(1, safeTotalPages);
  }
  return Math.max(1, safePage);
};
