import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import NoticeFormModal from '../../components/admin/NoticeFormModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../hooks/useToast';
import { getNoticesApi, createNoticeApi, updateNoticeApi, deleteNoticeApi } from '../../services/noticeService';
import { formatDate } from '../../utils/formatDate';
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiCalendar } from 'react-icons/fi';

const AdminNotices = () => {
  const { setMobileOpen } = useOutletContext();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, refetch } = useFetch(
    () => getNoticesApi({ page, search, limit: 8 }),
    [page, search]
  );

  const handleCreateNew = () => {
    setEditingNotice(null);
    setModalOpen(true);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await deleteNoticeApi(id);
      if (res.success) {
        addToast('Notice deleted successfully!', 'success');
        refetch();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete notice.', 'error');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editingNotice) {
        const res = await updateNoticeApi(editingNotice._id, formData);
        if (res.success) {
          addToast('Notice updated successfully!', 'success');
          setModalOpen(false);
          refetch();
        }
      } else {
        const res = await createNoticeApi(formData);
        if (res.success) {
          addToast('New notice published successfully!', 'success');
          setModalOpen(false);
          refetch();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error processing notice request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AdminHeader setMobileOpen={setMobileOpen} title="Manage Notices & Bulletins" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            onClear={() => setSearch('')}
            placeholder="Search notices by title..."
          />

          <button
            onClick={handleCreateNew}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <FiPlus className="text-lg" /> Publish New Notice
          </button>
        </div>

        {/* Notices Data Table */}
        {loading ? (
          <LoadingSpinner />
        ) : data?.notices && data.notices.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-900 text-slate-200 uppercase text-[11px] tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Title & Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Date Published</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.notices.map((notice) => (
                    <tr key={notice._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <span className="font-bold text-slate-900 font-serif block">{notice.title}</span>
                        <span className="text-xs text-slate-500 line-clamp-1">{notice.description}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-xs">
                          {notice.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {notice.isImportant ? (
                          <span className="bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 w-fit">
                            <FiAlertCircle /> Important
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Normal</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(notice.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Notice"
                        >
                          <FiEdit2 className="text-base" />
                        </button>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Notice"
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
            No notices found. Click "Publish New Notice" to create one.
          </div>
        )}
      </main>

      {/* Form Modal */}
      <NoticeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        notice={editingNotice}
        loading={submitting}
      />
    </div>
  );
};

export default AdminNotices;
