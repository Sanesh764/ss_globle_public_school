import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="text-center max-w-lg space-y-6 bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-4xl mx-auto shadow-inner">
          <FiAlertCircle />
        </div>
        <h1 className="text-5xl font-extrabold font-serif text-slate-900">404</h1>
        <h2 className="text-2xl font-bold font-serif text-slate-800">Page Not Found</h2>
        <p className="text-slate-600 text-sm">
          The requested page URL does not exist or has been moved.
        </p>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
          >
            <FiHome /> Return to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
