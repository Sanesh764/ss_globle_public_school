import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import NoticeModal from '../../components/common/NoticeModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { NOTICE_CATEGORIES } from '../../utils/constants';
import { useFetch } from '../../hooks/useFetch';
import { getNoticesApi } from '../../services/noticeService';
import { formatDate } from '../../utils/formatDate';
import { FiCalendar, FiAlertCircle, FiTag } from 'react-icons/fi';

const NoticeBoard = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const { data, loading } = useFetch(
    () => getNoticesApi({ page, search, category, limit: 8 }),
    [page, search, category]
  );

  return (
    <div>
      <PageHeader
        title="Official Notice Board"
        subtitle="Stay updated with official school circulars, exam date sheets, holiday announcements, and admissions."
        breadcrumb={[{ label: 'Notice Board' }]}
      />

      <section className="py-16 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Controls Bar: Search & Category Tabs */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              onClear={() => setSearch('')}
              placeholder="Search notice by keyword..."
            />

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {NOTICE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notices Grid */}
          {loading ? (
            <LoadingSpinner />
          ) : data?.notices && data.notices.length > 0 ? (
            <div className="space-y-4">
              {data.notices.map((notice) => (
                <div
                  key={notice._id}
                  onClick={() => setSelectedNotice(notice)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {notice.category || 'General'}
                      </span>
                      {notice.isImportant && (
                        <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <FiAlertCircle /> Urgent / Important
                        </span>
                      )}
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <FiCalendar /> Published: {formatDate(notice.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 font-serif hover:text-blue-600 transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {notice.description}
                    </p>
                  </div>

                  <button className="shrink-0 px-5 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                    Read Full Circular
                  </button>
                </div>
              ))}

              <Pagination
                currentPage={page}
                totalPages={data.pages || 1}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              No notices match your current search or category filter.
            </div>
          )}
        </div>
      </section>

      {/* Notice Detail Popup */}
      <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </div>
  );
};

export default NoticeBoard;
