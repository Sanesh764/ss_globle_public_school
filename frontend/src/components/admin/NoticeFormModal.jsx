import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
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

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-[#CFC5B1] rounded-sm text-sm text-[#252821] focus:outline-none focus:border-[#34483B] focus:ring-1 focus:ring-[#34483B]';
  const labelClass = 'block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-[#252821]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F4EFE3] rounded-sm max-w-xl w-full shadow-xl overflow-hidden border border-[#CFC5B1]">
        <div className="bg-[#34483B] px-6 py-4 text-[#F4EFE3] flex items-center justify-between border-b-2 border-[#AD8746]">
          <h3 className="font-serif font-bold text-lg">
            {notice ? 'Edit Notice Announcement' : 'Publish New Notice'}
          </h3>
          <button onClick={onClose} className="text-[#EBE2CC] hover:text-white p-1" aria-label="Close">
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Notice Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Mid-Term Examination Date Sheet"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={inputClass}
              >
                {NOTICE_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#252821]">
                <input
                  type="checkbox"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="w-4 h-4 accent-[#34483B]"
                />
                Mark as High Priority / Urgent
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>Notice Content &amp; Description *</label>
            <textarea
              required
              rows="5"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter full notice announcement details..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Attachment Link / PDF Document URL (Optional)</label>
            <input
              type="text"
              value={formData.attachmentUrl}
              onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div className="pt-4 border-t border-[#CFC5B1] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-sm border border-[#CFC5B1] bg-[#EBE2CC] text-[#252821] text-sm font-semibold hover:bg-[#DED5C1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-sm font-semibold disabled:opacity-50"
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
