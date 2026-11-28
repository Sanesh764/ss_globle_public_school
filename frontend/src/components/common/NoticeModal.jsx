import React from 'react';
import { FiX, FiCalendar, FiAlertCircle, FiDownload } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';
import { trackNoticeDownload } from '../../utils/analytics';

const NoticeModal = ({ notice, onClose }) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#252821]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F4EFE3] rounded-sm max-w-2xl w-full shadow-xl overflow-hidden border border-[#CFC5B1]">
        {/* Modal Header */}
        <div className="bg-[#34483B] p-6 text-[#F4EFE3] relative border-b-2 border-[#AD8746]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#EBE2CC] hover:text-white bg-[#27372D] rounded-sm transition-colors border border-[#4B6353]"
            aria-label="Close Notice"
          >
            <FiX className="text-lg" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#AD8746] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
              {notice.category || 'General'}
            </span>
            {notice.isImportant && (
              <span className="bg-[#7F2E2E] text-[#F4EFE3] text-[11px] font-semibold px-2.5 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                <FiAlertCircle /> Important
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif leading-snug pr-8">
            {notice.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-[#EBE2CC]/80 mt-3">
            <FiCalendar className="text-[#AD8746]" /> Published on: {formatDate(notice.createdAt)}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="text-[#252821] leading-relaxed text-sm sm:text-base whitespace-pre-line bg-[#EBE2CC]/60 p-5 rounded-sm border border-[#CFC5B1]">
            {notice.description}
          </div>

          {notice.attachmentUrl && (
            <div className="pt-2">
              <a
                href={notice.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackNoticeDownload(notice.title, notice.attachmentUrl)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#34483B] text-[#F4EFE3] hover:bg-[#27372D] font-semibold rounded-sm text-sm transition-colors"
              >
                <FiDownload className="text-[#AD8746]" /> View Official Attachment / Document
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#EBE2CC] px-6 py-4 flex justify-end border-t border-[#CFC5B1]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#252821] text-[#F4EFE3] hover:bg-[#34483B] rounded-sm text-sm font-semibold transition-colors"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeModal;
