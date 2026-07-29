import React from 'react';
import { FiX, FiCalendar, FiAlertCircle, FiDownload } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';
import { trackNoticeDownload } from '../../utils/analytics';

const NoticeModal = ({ notice, onClose }) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 transform transition-all">
        {/* Modal Header */}
        <div className="primary-gradient p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX className="text-xl" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {notice.category || 'General'}
            </span>
            {notice.isImportant && (
              <span className="bg-rose-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <FiAlertCircle /> Important
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif leading-snug">
            {notice.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-blue-200 mt-3">
            <FiCalendar /> Published on: {formatDate(notice.createdAt)}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
            {notice.description}
          </div>

          {notice.attachmentUrl && (
            <div className="pt-2">
              <a
                href={notice.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackNoticeDownload(notice.title, notice.attachmentUrl)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-xl text-sm transition-colors border border-blue-200"
              >
                <FiDownload /> View Official Attachment / Document
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeModal;
