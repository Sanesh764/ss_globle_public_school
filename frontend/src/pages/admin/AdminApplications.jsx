import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiFileText, FiAlertCircle, FiRefreshCw, FiFilter, FiEye } from 'react-icons/fi';
import AdminHeader from '../../components/admin/AdminHeader';
import ApplicationDetailModal from '../../components/admin/ApplicationDetailModal';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAdminApplications } from '../../services/adminApplicationService';
import { CLASS_OPTIONS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import { useToast } from '../../hooks/useToast';

const APPLICATION_STATUS_FILTERS = [
  'All',
  'Pending',
  'Correction Requested',
  'Approved',
  'Rejected',
];

const DEFAULT_LIMIT = 15;

const STATUS_BADGE_STYLES = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-300',
  'Correction Requested': 'bg-orange-100 text-orange-800 border-orange-300',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Rejected: 'bg-rose-100 text-rose-800 border-rose-300',
};

const AdminApplications = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});
  const { addToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [classApplyingFor, setClassApplyingFor] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    currentPage: 1,
    pageSize: DEFAULT_LIMIT,
    totalPages: 1,
  });

  const requestIdRef = useRef(0);

  // Debounce search input to avoid excessive API requests while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchApplications = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        limit: DEFAULT_LIMIT,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status !== 'All') params.status = status;
      if (classApplyingFor !== 'All') params.classApplyingFor = classApplyingFor;

      const res = await getAdminApplications(params);

      // Ignore stale responses if filters/search changed mid-flight
      if (currentRequestId !== requestIdRef.current) return;

      const list = Array.isArray(res?.data?.applications) ? res.data.applications : [];
      const pageMeta = res?.data?.pagination || {
        totalRecords: list.length,
        currentPage: page,
        pageSize: DEFAULT_LIMIT,
        totalPages: 1,
      };

      setApplications(list);
      setPagination({
        totalRecords: Number(pageMeta.totalRecords) || 0,
        currentPage: Number(pageMeta.currentPage) || page,
        pageSize: Number(pageMeta.pageSize) || DEFAULT_LIMIT,
        totalPages: Number(pageMeta.totalPages) || 1,
      });
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      const errMsg =
        err?.response?.data?.message || 'Failed to load student applications. Please try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, debouncedSearch, status, classApplyingFor, addToast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleClassChange = (e) => {
    setClassApplyingFor(e.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('All');
    setClassApplyingFor('All');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) || status !== 'All' || classApplyingFor !== 'All';

  return (
    <div className="space-y-6">
      <AdminHeader setMobileOpen={setMobileOpen} title="Student Applications" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Subtitle & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#CFC5B1] pb-4">
          <div>
            <p className="text-sm text-[#55594E]">
              Manage, review, and track student admission applications.
            </p>
          </div>
          <div className="text-xs font-semibold text-[#34483B] bg-[#EBE2CC] border border-[#CFC5B1] px-3 py-1.5 rounded-sm self-start sm:self-auto">
            Total Applications: {pagination.totalRecords}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-[#EBE2CC]/55 p-4 sm:p-5 rounded-sm border border-[#CFC5B1] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="w-full lg:max-w-md">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="Search by application no., student name, or phone..."
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <FiFilter className="text-[#34483B] shrink-0 hidden sm:block" />
              <label htmlFor="status-filter" className="sr-only">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={status}
                onChange={handleStatusChange}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm text-xs sm:text-sm font-semibold text-[#252821] focus:outline-none focus:ring-1 focus:ring-[#34483B] focus:border-[#34483B]"
              >
                {APPLICATION_STATUS_FILTERS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? 'All Statuses' : opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="class-filter" className="sr-only">
                Filter by Class
              </label>
              <select
                id="class-filter"
                value={classApplyingFor}
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
          </div>
        </div>

        {/* Content Area: Loading / Error / Empty / Table */}
        {loading ? (
          <div className="bg-white border border-[#CFC5B1] rounded-sm py-12">
            <LoadingSpinner text="Loading student applications..." />
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
                Unable to Load Applications
              </h3>
              <p className="text-sm text-[#55594E] max-w-md mx-auto">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchApplications}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-xs font-semibold tracking-wide transition-colors"
            >
              <FiRefreshCw />
              <span>Retry</span>
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-[#CFC5B1] rounded-sm p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-sm bg-[#EBE2CC] border border-[#CFC5B1] text-[#34483B] flex items-center justify-center text-xl">
              <FiFileText />
            </div>
            <h3 className="text-base font-bold font-serif text-[#34483B]">
              {hasActiveFilters ? 'No Matching Applications Found' : 'No Applications Submitted Yet'}
            </h3>
            <p className="text-sm text-[#55594E] max-w-md mx-auto">
              {hasActiveFilters
                ? 'No student applications match your current search or filter selection.'
                : 'When students or parents submit online registrations, they will appear here for review.'}
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
                    <th className="py-3.5 px-5 whitespace-nowrap">Application Number</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Student Name</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Class</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Submission Date</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CFC5B1]/50">
                  {applications.map((app) => {
                    const badgeStyle =
                      STATUS_BADGE_STYLES[app.status] ||
                      'bg-[#EBE2CC] text-[#252821] border-[#CFC5B1]';

                    return (
                      <tr key={app._id} className="hover:bg-[#F4EFE3]/60 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-xs sm:text-sm font-semibold text-[#34483B] whitespace-nowrap">
                          {app.applicationNumber}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-[#252821] whitespace-nowrap">
                          {app.fullName}
                        </td>
                        <td className="py-3.5 px-5 text-xs sm:text-sm text-[#55594E] whitespace-nowrap">
                          {app.classApplyingFor}
                        </td>
                        <td className="py-3.5 px-5 text-xs sm:text-sm text-[#55594E] whitespace-nowrap">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${badgeStyle}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedApplicationId(app._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#CFC5B1] bg-[#F4EFE3] hover:bg-[#EBE2CC] text-[#34483B] text-xs font-semibold transition-colors"
                            aria-label={`View application ${app.applicationNumber}`}
                          >
                            <FiEye />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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

      <ApplicationDetailModal
        applicationId={selectedApplicationId}
        isOpen={Boolean(selectedApplicationId)}
        onClose={() => setSelectedApplicationId(null)}
        onApplicationUpdated={fetchApplications}
      />
    </div>
  );
};

export default AdminApplications;
