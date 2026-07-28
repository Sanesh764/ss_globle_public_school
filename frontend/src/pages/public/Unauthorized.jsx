import React from 'react';
import { Link } from 'react-router-dom';
import { FiShieldOff, FiLock, FiHome } from 'react-icons/fi';

const Unauthorized = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="text-center max-w-md space-y-6 bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-4xl mx-auto shadow-inner">
          <FiShieldOff />
        </div>
        <h1 className="text-4xl font-extrabold font-serif text-slate-900">403</h1>
        <h2 className="text-2xl font-bold font-serif text-slate-800">Access Denied</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          You do not have administrator permissions to access this private route. Please log in with valid credentials.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
          >
            <FiLock /> Admin Sign In
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl border border-slate-300 transition-colors"
          >
            <FiHome /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
