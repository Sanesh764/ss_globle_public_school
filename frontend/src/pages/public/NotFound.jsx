import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { FiHome, FiAlertCircle, FiLock } from 'react-icons/fi';

const NotFound = () => {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <SEO
        title="404 Page Not Found | S.S. Global Public School"
        description="The requested page could not be found on S.S. Global Public School website."
        noindex={true}
      />
      <div className="text-center max-w-lg w-full space-y-6 bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200">
        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-4xl mx-auto shadow-inner">
          <FiAlertCircle />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold font-serif text-slate-900">404</h1>
          <h2 className="text-2xl font-bold font-serif text-slate-800">Page Not Found</h2>
          <p className="text-slate-600 text-sm max-w-sm mx-auto">
            The requested page URL does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:shadow-lg"
          >
            <FiHome className="text-lg" /> Go to Home Page
          </Link>

          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl border border-slate-300 transition-colors"
          >
            <FiLock className="text-amber-500" /> Admin Sign In
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
