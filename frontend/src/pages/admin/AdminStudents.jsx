import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiUsers, FiAlertCircle, FiRefreshCw, FiFilter, FiEye } from 'react-icons/fi';
import AdminHeader from '../../components/admin/AdminHeader';
import StudentDetailModal from '../../components/admin/StudentDetailModal';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAdminStudents } from '../../services/adminStudentService';
import { CLASS_OPTIONS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import {
  DEFAULT_STUDENT_PAGE_SIZE,
  STUDENT_STATUS_FILTER_OPTIONS,
  buildStudentListQueryParams,
  normalizeStudentListResponse,
  getStudentStatusSummaryLabel,
  getStudentListErrorMessage,
  getSafeBoundedPage,
} from '../../utils/adminStudentListUtils';

const AdminStudents = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [className, setClassName] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    currentPage: 1,
    pageSize: DEFAULT_STUDENT_PAGE_SIZE,
    totalPages: 0,
  });

  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStudents = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError('');

      const params = buildStudentListQueryParams({
        page,
        limit: DEFAULT_STUDENT_PAGE_SIZE,
        search: debouncedSearch,
        className,
        statusFilter,
      });

      const res = await getAdminStudents(params);
      if (currentRequestId !== requestIdRef.current) return;

      const normalized = normalizeStudentListResponse(res, page);
      const boundedPage = getSafeBoundedPage(page, normalized.pagination.totalPages);
      if (boundedPage !== page) {
        setPage(boundedPage);
        return;
      }
      setStudents(normalized.students);
      setPagination(normalized.pagination);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(getStudentListErrorMessage(err));
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, debouncedSearch, className, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  };

  const handleClassChange = (e) => {
    setClassName(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setClassName('All');
    setStatusFilter('all');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) || className !== 'All' || statusFilter !== 'all';

  return (
    <div className="space-y-6">
      <AdminHeader setMobileOpen={setMobileOpen} title="Student Management" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Subtitle & Compact Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#CFC5B1] pb-4">
          <p className="text-sm text-[#55594E]">
            Manage admitted students, student information, and enrollment status.
          </p>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-[#34483B] bg-[#EBE2CC] border border-[#CFC5B1] px-3 py-1.5 rounded-sm">
              {getStudentStatusSummaryLabel(statusFilter, className)}
            </span>
            <span className="text-xs font-semibold text-[#34483B] bg-white border border-[#CFC5B1] px-3 py-1.5 rounded-sm">
              Matching Students: {pagination.totalRecords}
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-[#EBE2CC]/55 p-4 sm:p-5 rounded-sm border border-[#CFC5B1] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="w-full lg:max-w-md">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="Search by student name, phone, admission no., or application no..."
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <FiFilter className="text-[#34483B] shrink-0 hidden sm:block" />
              <label htmlFor="student-class-filter" className="sr-only">
                Filter by Class
              </label>
              <select
                id="student-class-filter"
                value={className}
                onChange={handleClassChange}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm text-xs sm:text-sm font-semibold text-[#252821] focus:outline-none focus:ring-1 focus:ring-[#34483B] focus:border-[#34483B]"
              >
                <option value="All">All Classes</option>
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="student-status-filter" className="sr-only">
                Filter by Enrollment Status
              </label>
              <select
                id="student-status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm text-xs sm:text-sm font-semibold text-[#252821] focus:outline-none focus:ring-1 focus:ring-[#34483B] focus:border-[#34483B]"
              >
                {STUDENT_STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area: Loading / Error / Empty / Table */}
        {loading ? (
          <div className="bg-white border border-[#CFC5B1] rounded-sm py-12">
            <LoadingSpinner text="Loading student records..." />
          </div>
        ) : error ? (
          <div
            role="alert"
            className="bg-white border border-rose-300 rounded-sm p-8 text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto rounded-sm bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center text-xl">
              <FiAlertCircle />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-serif text-[#252821]">
                Unable to Load Students
              </h3>
              <p className="text-sm text-[#55594E] max-w-md mx-auto">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchStudents}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-xs font-semibold tracking-wide transition-colors"
            >
              <FiRefreshCw />
              <span>Retry</span>
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white border border-[#CFC5B1] rounded-sm p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-sm bg-[#EBE2CC] border border-[#CFC5B1] text-[#34483B] flex items-center justify-center text-xl">
              <FiUsers />
            </div>
            <h3 className="text-base font-bold font-serif text-[#34483B]">
              {hasActiveFilters ? 'No Matching Students Found' : 'No Students Admitted Yet'}
            </h3>
            <p className="text-sm text-[#55594E] max-w-md mx-auto">
              {hasActiveFilters
                ? 'No permanent student records match your current search or filter selection.'
                : 'Approved student applications will appear here as permanent student records.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center px-4 py-2 rounded-sm border border-[#CFC5B1] bg-[#F4EFE3] hover:bg-[#EBE2CC] text-[#34483B] text-xs font-semibold transition-colors"
              >
                Clear Search &amp; Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-[#CFC5B1] rounded-sm shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#252821]">
                <thead className="bg-[#EBE2CC]/60 text-[#34483B] font-serif font-bold border-b border-[#CFC5B1] uppercase text-xs">
                  <tr>
                    <th className="py-3.5 px-5 whitespace-nowrap">Student Name</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Admission Number</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Class</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Contact Number</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Admission Date</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CFC5B1]/50">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-[#F4EFE3]/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-[#252821] whitespace-nowrap">
                        {student.fullName}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs sm:text-sm whitespace-nowrap">
                        {student.admissionNumber ? (
                          <span className="font-semibold text-[#34483B]">
                            {student.admissionNumber}
                          </span>
                        ) : (
                          <span className="text-[#55594E] italic font-sans">Not assigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-xs sm:text-sm text-[#34483B] font-medium whitespace-nowrap">
                        {student.className}
                      </td>
                      <td className="py-3.5 px-5 text-xs sm:text-sm text-[#55594E] whitespace-nowrap">
                        {student.contactNumber}
                      </td>
                      <td className="py-3.5 px-5 text-xs sm:text-sm text-[#55594E] whitespace-nowrap">
                        {formatDate(student.admittedAt) || 'Not available'}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${
                            student.isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentId(student._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#CFC5B1] bg-[#F4EFE3] hover:bg-[#EBE2CC] text-[#34483B] text-xs font-semibold transition-colors"
                          aria-label={`View student ${student.fullName}`}
                        >
                          <FiEye />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        )}
      </main>

      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
        onStudentUpdated={fetchStudents}
      />
    </div>
  );
};

export default AdminStudents;
