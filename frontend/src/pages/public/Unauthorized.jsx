import React from 'react';
import { Link } from 'react-router-dom';
import { FiShieldOff, FiLock, FiHome } from 'react-icons/fi';
import SEO from '../../components/common/SEO';

const Unauthorized = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#F4EFE3] px-4 py-16">
      <SEO
        title="Access Denied | S.S. Global Public School"
        description="Administrator authentication is required to access this private route."
        noindex={true}
      />
      <div className="text-center max-w-md space-y-5 bg-[#EBE2CC] p-10 rounded-sm border border-[#CFC5B1]">
        <div className="w-16 h-16 rounded-sm bg-[#F4EFE3] border border-[#CFC5B1] text-[#7F2E2E] flex items-center justify-center text-3xl mx-auto">
          <FiShieldOff />
        </div>
        <h1 className="text-4xl font-bold font-serif text-[#34483B]">403</h1>
        <h2 className="text-2xl font-bold font-serif text-[#252821]">Access Denied</h2>
        <p className="text-[#55594E] text-sm leading-relaxed">
          You do not have administrator permissions to access this private route. Please log in with valid credentials.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm rounded-sm transition-colors"
          >
            <FiLock className="text-[#AD8746]" /> Admin Sign In
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#F4EFE3] hover:bg-[#DED5C1] text-[#252821] font-semibold text-sm rounded-sm border border-[#CFC5B1] transition-colors"
          >
            <FiHome /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
