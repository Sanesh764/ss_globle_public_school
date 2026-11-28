import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiLock } from 'react-icons/fi';

const SessionExpired = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#F4EFE3] px-4 py-16">
      <div className="text-center max-w-md space-y-5 bg-[#EBE2CC] p-10 rounded-sm border border-[#CFC5B1]">
        <div className="w-16 h-16 rounded-sm bg-[#F4EFE3] border border-[#CFC5B1] text-[#AD8746] flex items-center justify-center text-3xl mx-auto">
          <FiClock />
        </div>
        <h2 className="text-2xl font-bold font-serif text-[#34483B]">Session Expired</h2>
        <p className="text-[#55594E] text-sm leading-relaxed">
          Your administrator session has expired for security reasons. Please log in again to continue managing the school portal.
        </p>
        <div>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm rounded-sm transition-colors"
          >
            <FiLock className="text-[#AD8746]" /> Log In Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SessionExpired;
