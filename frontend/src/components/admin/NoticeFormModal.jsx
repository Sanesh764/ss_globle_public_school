import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { NOTICE_CATEGORIES } from '../../utils/constants';

const NoticeFormModal = ({ isOpen, onClose, onSubmit, notice = null, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    isImportant: false,
    attachmentUrl: '',
  });

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title || '',
        description: notice.description || '',
        category: notice.category || 'General',
        isImportant: notice.isImportant || false,
        attachmentUrl: notice.attachmentUrl || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'General',
        isImportant: false,
        attachmentUrl: '',
      });
    }
  }, [notice, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg">
            {notice ? 'Edit Notice Announcement' : 'Publish New Notice'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Mid-Term Examination Date Sheet"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {NOTICE_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Mark as High Priority / Urgent
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Notice Content & Description *
            </label>
            <textarea
              required
              rows="5"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter full notice announcement details..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Attachment Link / PDF Document URL (Optional)
            </label>
            <input
              type="text"
              value={formData.attachmentUrl}
              onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Saving...' : notice ? 'Update Notice' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeFormModal;
