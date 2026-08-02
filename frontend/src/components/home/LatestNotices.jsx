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
    <section className="py-20 bg-slate-950 text-white min-h-[450px] border-t border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              Official Bulletin
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white mt-3">
              Latest School Notices
            </h2>
          </div>
          <Link
            to="/notices"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm hover:underline"
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
              {error ? (
                <div className="p-8 text-center bg-amber-500/10 rounded-2xl border border-amber-400/30 text-amber-300 text-sm font-medium">
                  Information is temporarily unavailable. Please check again shortly.
                </div>
              ) : noticesList.length > 0 ? (
                noticesList.map((notice) => (
                  <div
                    key={notice._id}
                    onClick={() => setSelectedNotice(notice)}
                    className="p-5 rounded-3xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-hover"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {notice.category || 'General'}
                        </span>
                        {notice.isImportant && (
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <FiAlertCircle /> Important
                          </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <FiCalendar className="text-amber-400" /> {formatDate(notice.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white font-serif hover:text-blue-400 transition-colors">
                        {notice.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-1">
                        {notice.description}
                      </p>
                    </div>

                    <button className="shrink-0 px-4 py-2 bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs rounded-xl hover:bg-amber-400 hover:text-slate-950 transition-colors">
                      Read Notice
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-900 rounded-2xl text-slate-400 border border-slate-800">
                  No notices published yet.
                </div>
              )}
            </div>

            {/* Right Side Announcement Spotlight */}
            <div className="lg:col-span-4 primary-gradient text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden border border-blue-400/30">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-400/20">
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
                  className="block text-center w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md shadow-amber-500/20"
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
