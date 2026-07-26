import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import Pagination from '../../components/common/Pagination';
import MessageModal from '../../components/admin/MessageModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../hooks/useToast';
import { getContactMessagesApi, deleteContactMessageApi, toggleReadMessageApi } from '../../services/contactService';
import { formatDateTime } from '../../utils/formatDate';
import { FiMail, FiTrash2, FiEye, FiCheckCircle } from 'react-icons/fi';

const AdminMessages = () => {
  const { setMobileOpen } = useOutletContext();
  const { addToast } = useToast();

  const [page, setPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const { data, loading, refetch } = useFetch(
    () => getContactMessagesApi(page),
    [page]
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await deleteContactMessageApi(id);
      if (res.success) {
        addToast('Contact message deleted!', 'success');
        refetch();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete message.', 'error');
    }
  };

  const handleToggleRead = async (id) => {
    try {
      await toggleReadMessageApi(id);
      refetch();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleOpenDetail = (message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      handleToggleRead(message._id);
    }
  };

  return (
    <div>
      <AdminHeader setMobileOpen={setMobileOpen} title="Manage Contact Messages" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          <LoadingSpinner />
        ) : data?.messages && data.messages.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-900 text-slate-200 uppercase text-[11px] tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Sender</th>
                    <th className="px-6 py-4">Phone / Email</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Date Received</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.messages.map((msg) => (
                    <tr
                      key={msg._id}
                      className={`hover:bg-slate-50 transition-colors ${
                        !msg.isRead ? 'bg-blue-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-bold font-serif text-slate-900">
                        {msg.name}
                        {!msg.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <div>{msg.email}</div>
                        <div className="text-slate-400">{msg.phone}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <span className="font-semibold text-slate-800 block">{msg.subject || 'Inquiry'}</span>
                        <span className="text-xs text-slate-500 line-clamp-1">{msg.message}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDateTime(msg.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenDetail(msg)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Message Detail"
                        >
                          <FiEye className="text-base" />
                        </button>
                        <button
                          onClick={() => handleDelete(msg._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Message"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={page}
                totalPages={data.pages || 1}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            No contact messages received yet. All public form submissions will be listed here.
          </div>
        )}
      </main>

      {/* Message Modal */}
      <MessageModal message={selectedNotice || selectedMessage} onClose={() => setSelectedMessage(null)} />
    </div>
  );
};

export default AdminMessages;
