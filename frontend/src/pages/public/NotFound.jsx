import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { FiHome, FiAlertCircle, FiLock } from 'react-icons/fi';

const NotFound = () => {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-[#F4EFE3] px-4 py-16">
      <SEO
        title="404 Page Not Found | S.S. Global Public School"
        description="The requested page could not be found on S.S. Global Public School website."
        noindex={true}
      />
      <div className="text-center max-w-lg w-full space-y-6 bg-[#EBE2CC] p-8 sm:p-12 rounded-sm border border-[#CFC5B1]">
        <div className="w-16 h-16 rounded-sm bg-[#F4EFE3] border border-[#CFC5B1] text-[#AD8746] flex items-center justify-center text-3xl mx-auto">
          <FiAlertCircle />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-bold font-serif text-[#34483B]">404</h1>
          <h2 className="text-2xl font-bold font-serif text-[#252821]">Page Not Found</h2>
          <p className="text-[#55594E] text-sm max-w-sm mx-auto">
            The requested page URL does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm rounded-sm transition-colors"
          >
            <FiHome className="text-base text-[#AD8746]" /> Go to Home Page
          </Link>

          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#F4EFE3] hover:bg-[#DED5C1] text-[#252821] font-semibold text-sm rounded-sm border border-[#CFC5B1] transition-colors"
          >
            <FiLock className="text-[#AD8746]" /> Admin Sign In
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
