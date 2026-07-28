import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiLock } from 'react-icons/fi';

const SessionExpired = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="text-center max-w-md space-y-6 bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
        <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-4xl mx-auto shadow-inner">
          <FiClock />
        </div>
        <h2 className="text-2xl font-bold font-serif text-slate-800">Session Expired</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Your administrator session has expired for security reasons. Please log in again to continue managing the school portal.
        </p>
        <div>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
          >
            <FiLock /> Log In Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SessionExpired;
