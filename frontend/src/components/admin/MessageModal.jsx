import React from 'react';
import { FiX, FiMail, FiPhone, FiCalendar, FiSend } from 'react-icons/fi';
import { formatDateTime } from '../../utils/formatDate';

const MessageModal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#252821]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F4EFE3] rounded-sm max-w-xl w-full shadow-xl overflow-hidden border border-[#CFC5B1]">
        <div className="bg-[#34483B] px-6 py-4 text-[#F4EFE3] flex items-center justify-between border-b-2 border-[#AD8746]">
          <h3 className="font-serif font-bold text-lg">Inquiry Message Details</h3>
          <button onClick={onClose} className="text-[#EBE2CC] hover:text-white p-1" aria-label="Close">
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#CFC5B1] pb-4">
            <div>
              <h4 className="text-lg font-bold text-[#34483B] font-serif">{message.name || message.fullName}</h4>
              <p className="text-xs text-[#55594E] font-medium flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1"><FiMail className="text-[#AD8746]" /> {message.email}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1"><FiPhone className="text-[#AD8746]" /> {message.phone}</span>
              </p>
            </div>
            <span className="text-xs text-[#55594E] flex items-center gap-1 shrink-0">
              <FiCalendar className="text-[#AD8746]" /> {formatDateTime(message.createdAt)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#34483B] uppercase tracking-wider block mb-1">
              Subject
            </span>
            <p className="text-sm font-semibold text-[#252821] bg-[#EBE2CC] p-2.5 rounded-sm border border-[#CFC5B1]">
              {message.subject || 'General Inquiry'}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#34483B] uppercase tracking-wider block mb-1">
              Message Content
            </span>
            <div className="text-sm text-[#252821] bg-white p-4 rounded-sm border border-[#CFC5B1] leading-relaxed whitespace-pre-line">
              {message.message}
            </div>
          </div>
        </div>

        <div className="bg-[#EBE2CC] px-6 py-4 flex justify-between items-center border-t border-[#CFC5B1]">
          <a
            href={`mailto:${message.email}?subject=RE: ${encodeURIComponent(message.subject || 'School Inquiry')}`}
            className="px-4 py-2 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] rounded-sm text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FiSend className="text-[#AD8746]" /> Reply via Mail Client
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#252821] text-[#F4EFE3] hover:bg-[#34483B] rounded-sm text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
