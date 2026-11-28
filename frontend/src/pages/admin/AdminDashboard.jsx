import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { getNoticesApi } from '../../services/noticeService';
import { getGalleryApi } from '../../services/galleryService';
import { getContactMessagesApi } from '../../services/contactService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiBell, FiImage, FiMail, FiArrowRight, FiPlusCircle, FiSliders, FiClock } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';

const AdminDashboard = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});
  const { admin } = useAuth();
  const isStaff = admin?.role === 'staff';

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
          <div className="bg-[#EBE2CC]/60 p-6 rounded-sm border border-[#CFC5B1] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#55594E] uppercase tracking-wider">Total Notices</span>
              <h3 className="text-3xl font-bold font-serif text-[#34483B] mt-1">{totalNotices}</h3>
              <Link to="/admin/notices" className="text-xs font-semibold text-[#34483B] hover:text-[#AD8746] flex items-center gap-1 mt-2">
                Manage Notices <FiArrowRight />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-sm bg-[#F4EFE3] border border-[#CFC5B1] text-[#34483B] flex items-center justify-center text-xl">
              <FiBell />
            </div>
          </div>

          <div className="bg-[#EBE2CC]/60 p-6 rounded-sm border border-[#CFC5B1] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#55594E] uppercase tracking-wider">Gallery Images</span>
              <h3 className="text-3xl font-bold font-serif text-[#34483B] mt-1">{totalGallery}</h3>
              <Link to="/admin/gallery" className="text-xs font-semibold text-[#34483B] hover:text-[#AD8746] flex items-center gap-1 mt-2">
                Manage Gallery <FiArrowRight />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-sm bg-[#F4EFE3] border border-[#CFC5B1] text-[#AD8746] flex items-center justify-center text-xl">
              <FiImage />
            </div>
          </div>

          <div className="bg-[#EBE2CC]/60 p-6 rounded-sm border border-[#CFC5B1] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#55594E] uppercase tracking-wider">Contact Messages</span>
              <h3 className="text-3xl font-bold font-serif text-[#34483B] mt-1">{totalMessages}</h3>
              <Link to="/admin/messages" className="text-xs font-semibold text-[#34483B] hover:text-[#AD8746] flex items-center gap-1 mt-2">
                View Inbox <FiArrowRight />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-sm bg-[#F4EFE3] border border-[#CFC5B1] text-[#34483B] flex items-center justify-center text-xl">
              <FiMail />
            </div>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="bg-[#34483B] text-[#F4EFE3] p-6 rounded-sm border border-[#27372D] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-serif">Quick Management Shortcuts</h3>
            <p className="text-xs text-[#EBE2CC]/80 mt-0.5">Publish notices, update school info, or add photos to gallery.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/notices"
              className="px-4 py-2 bg-[#AD8746] hover:bg-[#8E6D35] text-white text-xs font-semibold rounded-sm transition-colors flex items-center gap-1.5"
            >
              <FiPlusCircle /> Add Notice
            </Link>
            <Link
              to="/admin/gallery"
              className="px-4 py-2 bg-[#F4EFE3] hover:bg-[#EBE2CC] text-[#34483B] text-xs font-semibold rounded-sm transition-colors flex items-center gap-1.5"
            >
              <FiImage /> Upload Photo
            </Link>
            {!isStaff && (
              <Link
                to="/admin/settings"
                className="px-4 py-2 bg-[#27372D] hover:bg-[#1E2B23] text-[#EBE2CC] text-xs font-semibold rounded-sm transition-colors flex items-center gap-1.5 border border-[#4B6353]"
              >
                <FiSliders className="text-[#AD8746]" /> Edit Settings
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#EBE2CC]/45 p-6 rounded-sm border border-[#CFC5B1] space-y-4">
              <div className="flex items-center justify-between border-b border-[#CFC5B1] pb-3">
                <h3 className="font-serif font-bold text-[#34483B] text-lg flex items-center gap-2">
                  <FiBell className="text-[#AD8746]" /> Recent Published Notices
                </h3>
                <Link to="/admin/notices" className="text-xs text-[#34483B] font-semibold hover:text-[#AD8746]">
                  View All
                </Link>
              </div>

              <div className="divide-y divide-[#CFC5B1]">
                {noticesList.length > 0 ? (
                  noticesList.slice(0, 4).map((n) => (
                    <div key={n._id} className="py-3 flex justify-between items-center text-sm gap-3">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#252821] line-clamp-1">{n.title}</h4>
                        <span className="text-[11px] text-[#55594E] flex items-center gap-1 mt-0.5">
                          <FiClock className="text-[#AD8746]" /> {formatDate(n.createdAt)} • {n.category}
                        </span>
                      </div>
                      <span className="text-[10px] bg-[#34483B] text-[#F4EFE3] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider shrink-0">
                        Active
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#55594E] py-4 text-center">No notices found.</p>
                )}
              </div>
            </div>

            <div className="bg-[#EBE2CC]/45 p-6 rounded-sm border border-[#CFC5B1] space-y-4">
              <div className="flex items-center justify-between border-b border-[#CFC5B1] pb-3">
                <h3 className="font-serif font-bold text-[#34483B] text-lg flex items-center gap-2">
                  <FiMail className="text-[#AD8746]" /> Recent Contact Messages
                </h3>
                <Link to="/admin/messages" className="text-xs text-[#34483B] font-semibold hover:text-[#AD8746]">
                  View Inbox
                </Link>
              </div>

              <div className="divide-y divide-[#CFC5B1]">
                {messagesList.length > 0 ? (
                  messagesList.slice(0, 4).map((m) => (
                    <div key={m._id} className="py-3 flex justify-between items-center text-sm gap-3">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#252821]">{m.name || m.fullName}</h4>
                        <p className="text-xs text-[#55594E] line-clamp-1">{m.subject || m.message}</p>
                      </div>
                      <span className="text-[11px] text-[#55594E] shrink-0">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#55594E] py-4 text-center">No messages received yet.</p>
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
