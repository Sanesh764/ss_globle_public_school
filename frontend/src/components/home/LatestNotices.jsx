import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiCalendar, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { useFetch } from '../../hooks/useFetch';
import { getNoticesApi } from '../../services/noticeService';
import { formatDate } from '../../utils/formatDate';
import NoticeModal from '../common/NoticeModal';
import LoadingSpinner from '../common/LoadingSpinner';

const LatestNotices = () => {
  const [selectedNotice, setSelectedNotice] = useState(null);
  const { data, loading, error } = useFetch(() => getNoticesApi({ page: 1, limit: 5 }), []);

  const noticesList = data?.notices || data?.data?.notices || (Array.isArray(data?.data) ? data.data : []);

  return (
    <section className="py-16 sm:py-20 bg-[#F4EFE3] text-[#252821] min-h-[420px] border-b border-[#CFC5B1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 pb-5 border-b border-[#CFC5B1]">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>Official Bulletin</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B] mt-2 tracking-tight">
              Latest School Notices
            </h2>
          </div>
          <Link
            to="/notices"
            className="inline-flex items-center gap-2 text-[#34483B] hover:text-[#AD8746] font-semibold text-sm transition-colors"
          >
            <span>Go to Digital Notice Board</span>
            <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="min-h-[260px] flex items-center justify-center">
            <LoadingSpinner text="Loading Notices..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Official Ruled Bulletin List */}
            <div className="lg:col-span-8">
              {error ? (
                <div className="p-8 text-center bg-[#EBE2CC] rounded-sm border border-[#CFC5B1] text-[#55594E] text-sm">
                  Information is temporarily unavailable. Please check again shortly.
                </div>
              ) : noticesList.length > 0 ? (
                <div className="divide-y divide-[#CFC5B1] border-t border-b border-[#CFC5B1]">
                  {noticesList.map((notice) => (
                    <div
                      key={notice._id}
                      onClick={() => setSelectedNotice(notice)}
                      className="py-4 px-3 sm:px-4 hover:bg-[#EBE2CC]/60 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="bg-[#EBE2CC] text-[#34483B] border border-[#CFC5B1] text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            {notice.category || 'General'}
                          </span>
                          {notice.isImportant && (
                            <span className="bg-[#7F2E2E]/10 text-[#7F2E2E] border border-[#7F2E2E]/30 text-[10px] font-semibold px-2 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                              <FiAlertCircle /> Important
                            </span>
                          )}
                          <span className="text-xs text-[#55594E] flex items-center gap-1">
                            <FiCalendar className="text-[#AD8746]" /> {formatDate(notice.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#34483B] font-serif group-hover:text-[#AD8746] transition-colors">
                          {notice.title}
                        </h3>
                        <p className="text-xs text-[#55594E] line-clamp-1">
                          {notice.description}
                        </p>
                      </div>

                      <button className="shrink-0 px-3.5 py-1.5 bg-[#F4EFE3] border border-[#CFC5B1] text-[#34483B] font-semibold text-xs rounded-sm group-hover:bg-[#34483B] group-hover:text-[#F4EFE3] group-hover:border-[#34483B] transition-colors">
                        Read Notice
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#EBE2CC] rounded-sm text-[#55594E] border border-[#CFC5B1] text-sm">
                  No notices published yet.
                </div>
              )}
            </div>

            {/* Right Side Official Bulletin Spotlight */}
            <div className="lg:col-span-4 bg-[#34483B] text-[#F4EFE3] p-7 sm:p-8 rounded-sm border border-[#27372D] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-sm bg-[#27372D] border border-[#AD8746]/60 text-[#AD8746] flex items-center justify-center text-xl">
                  <FiBell />
                </div>
                <h3 className="text-2xl font-bold font-serif text-[#F4EFE3]">Stay Informed</h3>
                <p className="text-[#EBE2CC]/85 text-sm leading-relaxed">
                  Regular notices regarding school holidays, examination schedules, fee structures, parent-teacher meetings, and academic activities are updated daily.
                </p>
              </div>

              <div className="pt-5 border-t border-[#4B6353]">
                <Link
                  to="/notices"
                  className="block text-center w-full py-3 bg-[#AD8746] hover:bg-[#8E6D35] text-white font-semibold text-sm rounded-sm transition-colors"
                >
                  View All Notices Archives
                </Link>
              </div>
            </div>
          </div>
        )}

        <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
      </div>
    </section>
  );
};

export default LatestNotices;
