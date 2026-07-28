import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { useFetch } from '../../hooks/useFetch';
import { getNoticesApi } from '../../services/noticeService';
import { getGalleryApi } from '../../services/galleryService';
import { getContactMessagesApi } from '../../services/contactService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiBell, FiImage, FiMail, FiArrowRight, FiPlusCircle, FiSliders, FiClock } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';

const AdminDashboard = () => {
  const { setMobileOpen } = useOutletContext();

  const { data: noticesData, loading: noticesLoading } = useFetch(() => getNoticesApi({ limit: 5 }), []);
  const { data: galleryData, loading: galleryLoading } = useFetch(() => getGalleryApi('All'), []);
  const { data: messagesData, loading: messagesLoading } = useFetch(() => getContactMessagesApi(1), []);

  const noticesList = noticesData?.data?.notices || noticesData?.notices || [];
  const galleryList = galleryData?.data?.images || galleryData?.images || [];
  const messagesList = messagesData?.data?.messages || messagesData?.messages || [];

  const totalNotices = noticesData?.data?.totalNotices || noticesData?.totalNotices || noticesList.length || 0;
  const totalGallery = galleryData?.data?.totalImages || galleryData?.totalImages || galleryList.length || 0;
  const totalMessages = messagesData?.data?.totalMessages || messagesData?.totalMessages || messagesList.length || 0;

  const isLoading = noticesLoading || galleryLoading || messagesLoading;

  return (
    <div>
      <AdminHeader setMobileOpen={setMobileOpen} title="Dashboard Overview" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Notices Stat */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between card-hover">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Notices</span>
              <h3 className="text-3xl font-extrabold font-serif text-slate-900 mt-1">{totalNotices}</h3>
              <Link to="/admin/notices" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mt-2">
                Manage Notices <FiArrowRight />
              </Link>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-inner">
              <FiBell />
            </div>
          </div>

          {/* Gallery Stat */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between card-hover">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gallery Images</span>
              <h3 className="text-3xl font-extrabold font-serif text-slate-900 mt-1">{totalGallery}</h3>
              <Link to="/admin/gallery" className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1 mt-2">
                Manage Gallery <FiArrowRight />
              </Link>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-2xl shadow-inner">
              <FiImage />
            </div>
          </div>

          {/* Messages Stat */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between card-hover">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Messages</span>
              <h3 className="text-3xl font-extrabold font-serif text-slate-900 mt-1">{totalMessages}</h3>
              <Link to="/admin/messages" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1 mt-2">
                View Inbox <FiArrowRight />
              </Link>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl shadow-inner">
              <FiMail />
            </div>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-serif">Quick Management Shortcuts</h3>
            <p className="text-xs text-slate-400">Publish notices, update school info, or add photos to gallery.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/notices"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <FiPlusCircle /> Add Notice
            </Link>
            <Link
              to="/admin/gallery"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <FiImage /> Upload Photo
            </Link>
            <Link
              to="/admin/settings"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <FiSliders /> Edit Settings
            </Link>
          </div>
        </div>

        {/* Recent Activity Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Notices */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-slate-900 text-lg flex items-center gap-2">
                  <FiBell className="text-blue-600" /> Recent Published Notices
                </h3>
                <Link to="/admin/notices" className="text-xs text-blue-600 font-semibold hover:underline">View All</Link>
              </div>

              <div className="space-y-3">
                {noticesList.length > 0 ? (
                  noticesList.slice(0, 4).map((n) => (
                    <div key={n._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-sm">
                      <div>
                        <h4 className="font-semibold text-slate-900 line-clamp-1">{n.title}</h4>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <FiClock /> {formatDate(n.createdAt)} • {n.category}
                        </span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">No notices found.</p>
                )}
              </div>
            </div>

            {/* Recent Inquiries */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-slate-900 text-lg flex items-center gap-2">
                  <FiMail className="text-emerald-600" /> Recent Contact Messages
                </h3>
                <Link to="/admin/messages" className="text-xs text-blue-600 font-semibold hover:underline">View Inbox</Link>
              </div>

              <div className="space-y-3">
                {messagesList.length > 0 ? (
                  messagesList.slice(0, 4).map((m) => (
                    <div key={m._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-sm">
                      <div>
                        <h4 className="font-semibold text-slate-900">{m.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{m.subject || m.message}</p>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">No messages received yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
