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
  const { data, loading } = useFetch(() => getNoticesApi({ page: 1, limit: 5 }), []);

  return (
    <section className="py-20 bg-white min-h-[450px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
              Official Bulletin
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 mt-3">
              Latest School Notices
            </h2>
          </div>
          <Link
            to="/notices"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm hover:underline"
          >
            Go to Digital Notice Board <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Ticker / Featured Cards */}
            <div className="lg:col-span-8 space-y-4">
              {data?.notices && data.notices.length > 0 ? (
                data.notices.map((notice) => (
                  <div
                    key={notice._id}
                    onClick={() => setSelectedNotice(notice)}
                    className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-hover"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {notice.category || 'General'}
                        </span>
                        {notice.isImportant && (
                          <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <FiAlertCircle /> Important
                          </span>
                        )}
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <FiCalendar /> {formatDate(notice.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 font-serif hover:text-blue-600 transition-colors">
                        {notice.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {notice.description}
                      </p>
                    </div>

                    <button className="shrink-0 px-4 py-2 bg-white border border-slate-300 text-blue-600 font-semibold text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                      Read Notice
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500">
                  No notices published yet.
                </div>
              )}
            </div>

            {/* Right Side Announcement Spotlight */}
            <div className="lg:col-span-4 primary-gradient text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl"></div>

              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg">
                  <FiBell />
                </div>
                <h3 className="text-2xl font-extrabold font-serif">Stay Informed</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Regular notices regarding school holidays, examination schedules, fee structures, parent-teacher meetings, and academic activities are updated daily.
                </p>
              </div>

              <div className="relative z-10 pt-6 border-t border-white/20">
                <Link
                  to="/notices"
                  className="block text-center w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-md"
                >
                  View All Notices Archives
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detail view */}
        <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
      </div>
    </section>
  );
};

export default LatestNotices;
