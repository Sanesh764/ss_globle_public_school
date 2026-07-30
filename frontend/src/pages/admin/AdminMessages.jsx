import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getContactMessagesApi,
  markMessageAsReadApi,
  markMessageAsRepliedApi,
  deleteContactMessageApi,
} from '../../services/contactService';
import { useToast } from '../../hooks/useToast';
import AdminHeader from '../../components/admin/AdminHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import { formatDate } from '../../utils/formatDate';
import {
  FiMail,
  FiEye,
  FiCheckCircle,
  FiTrash2,
  FiMapPin,
  FiPhoneCall,
  FiCalendar,
  FiMessageSquare,
  FiInbox,
  FiClock,
  FiCornerUpRight,
} from 'react-icons/fi';

const AdminMessages = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ totalInquiries: 0, unreadCount: 0, todayInquiries: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedMessage, setSelectedMessage] = useState(null);

  const { addToast } = useToast();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getContactMessagesApi({ page, limit: 10, search, status: filterStatus });
      if (res.success && res.data) {
        setMessages(res.data.messages || []);
        setStats(res.data.stats || { totalInquiries: 0, unreadCount: 0, todayInquiries: 0 });
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch inquiry messages.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, search, filterStatus]);

  const handleMarkRead = async (id) => {
    try {
      const res = await markMessageAsReadApi(id);
      if (res.success) {
        addToast('Inquiry marked as Read.', 'success');
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage({ ...selectedMessage, status: 'Read', isRead: true });
        }
        fetchMessages();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleMarkReplied = async (id) => {
    try {
      const res = await markMessageAsRepliedApi(id);
      if (res.success) {
        addToast('Inquiry marked as Replied.', 'success');
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage({ ...selectedMessage, status: 'Replied', isRead: true });
        }
        fetchMessages();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await deleteContactMessageApi(id);
      if (res.success) {
        addToast('Inquiry deleted successfully.', 'success');
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage(null);
        }
        fetchMessages();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete inquiry.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <AdminHeader
        setMobileOpen={setMobileOpen}
        title="Contact Inquiry Management"
        subtitle="View, search, filter, and respond to incoming admission and general school inquiries."
      />

      {/* Stats Header Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-2xl font-bold">
            <FiInbox />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Unread Inquiries</span>
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.unreadCount}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-2xl font-bold">
            <FiMessageSquare />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Inquiries</span>
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.totalInquiries}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl font-bold">
            <FiClock />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Today's Inquiries</span>
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.todayInquiries}</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="max-w-md w-full">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by name, phone, email, subject, city..."
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="All">All Inquiries</option>
            <option value="Unread">Unread Only</option>
            <option value="Read">Read Only</option>
            <option value="Replied">Replied Only</option>
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-serif font-bold border-b border-slate-200 uppercase text-xs">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Direct Contact</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const name = msg.fullName || msg.name;
                    const status = msg.status || (msg.isRead ? 'Read' : 'Unread');
                    const cleanPhone = (msg.phone || '').replace(/[^\d+]/g, '');

                    return (
                      <tr key={msg._id} className={`hover:bg-slate-50/80 transition-colors ${status === 'Unread' ? 'bg-amber-50/30 font-semibold' : ''}`}>
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-900 block font-serif">{name}</span>
                        </td>
                        <td className="py-4 px-6 text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg font-bold transition-colors"
                              title="Call parent via phone"
                            >
                              <FiPhoneCall className="text-amber-600" /> {msg.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${msg.email}`}
                              className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium"
                              title="Send direct email"
                            >
                              <FiMail className="text-blue-500" /> {msg.email}
                            </a>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600">
                          {msg.city || 'Daudnagar'}, {msg.district || 'Aurangabad'}
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <span className="font-bold text-slate-900 block truncate">{msg.subject}</span>
                          <span className="text-xs text-slate-500 line-clamp-1 italic">"{msg.message}"</span>
                        </td>
                        <td className="py-4 px-6">
                          {status === 'Unread' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Unread
                            </span>
                          )}
                          {status === 'Read' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-100 border border-blue-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Read
                            </span>
                          )}
                          {status === 'Replied' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Replied
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(msg.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedMessage(msg);
                              if (status === 'Unread') handleMarkRead(msg._id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Full Detail"
                          >
                            <FiEye className="text-lg" />
                          </button>
                          {status === 'Unread' && (
                            <button
                              onClick={() => handleMarkRead(msg._id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Mark as Read"
                            >
                              <FiCheckCircle className="text-lg" />
                            </button>
                          )}
                          {status !== 'Replied' && (
                            <button
                              onClick={() => handleMarkReplied(msg._id)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Mark as Replied"
                            >
                              <FiCornerUpRight className="text-lg" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(msg._id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Inquiry"
                          >
                            <FiTrash2 className="text-lg" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500">
                      No inquiries match your current search/filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Inquiry Detail View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Inquiry Detail</span>
                <h3 className="text-xl font-bold font-serif text-slate-900">
                  {selectedMessage.subject}
                </h3>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            {/* Sender Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Full Name</span>
                <span className="font-bold text-slate-900 text-base">{selectedMessage.fullName || selectedMessage.name}</span>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Current Status</span>
                <span className="font-extrabold uppercase text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 inline-block mt-0.5">
                  {selectedMessage.status || 'Read'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Phone Number (Call Direct)</span>
                <a
                  href={`tel:${(selectedMessage.phone || '').replace(/[^\d+]/g, '')}`}
                  className="font-extrabold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 mt-0.5 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-200 inline-flex"
                >
                  <FiPhoneCall /> Call: {selectedMessage.phone}
                </a>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Email Address (Send Mail)</span>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="font-extrabold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 mt-0.5 bg-blue-100/80 px-3 py-1.5 rounded-xl border border-blue-200 inline-flex"
                >
                  <FiMail /> Mail: {selectedMessage.email}
                </a>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Location</span>
                <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                  <FiMapPin className="text-amber-500" /> {selectedMessage.city || 'Daudnagar'}, {selectedMessage.district || 'Aurangabad'}, {selectedMessage.state || 'Bihar'} {selectedMessage.pinCode ? `- ${selectedMessage.pinCode}` : ''}
                </span>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Submission Date</span>
                <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                  <FiCalendar className="text-blue-500" /> {formatDate(selectedMessage.createdAt)}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Complete Message Text:</h4>
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 flex flex-wrap justify-between items-center gap-3 border-t border-slate-100">
              <button
                onClick={() => handleDelete(selectedMessage._id)}
                className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <FiTrash2 /> Delete Inquiry
              </button>

              <div className="flex gap-2">
                {selectedMessage.status !== 'Read' && (
                  <button
                    onClick={() => handleMarkRead(selectedMessage._id)}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                  >
                    <FiCheckCircle /> Mark as Read
                  </button>
                )}
                {selectedMessage.status !== 'Replied' && (
                  <button
                    onClick={() => handleMarkReplied(selectedMessage._id)}
                    className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                  >
                    <FiCornerUpRight /> Mark as Replied
                  </button>
                )}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
