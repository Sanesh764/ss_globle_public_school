import React from 'react';
import { FiX, FiMail, FiPhone, FiCalendar, FiSend } from 'react-icons/fi';
import { formatDateTime } from '../../utils/formatDate';

const MessageModal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg">Inquiry Message Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900 font-serif">{message.name}</h4>
              <p className="text-xs text-blue-600 font-medium flex items-center gap-2 mt-0.5">
                <FiMail /> {message.email} • <FiPhone /> {message.phone}
              </p>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <FiCalendar /> {formatDateTime(message.createdAt)}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Subject:
            </span>
            <p className="text-sm font-semibold text-slate-800 bg-slate-100 p-2.5 rounded-lg">
              {message.subject || 'General Inquiry'}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Message Content:
            </span>
            <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
              {message.message}
            </div>
          </div>
        </div>

        <div className="bg-slate-100 px-6 py-4 flex justify-between items-center">
          <a
            href={`mailto:${message.email}?subject=RE: ${encodeURIComponent(message.subject || 'School Inquiry')}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <FiSend /> Reply via Mail Client
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
