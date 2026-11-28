import React from 'react';
import { FiMenu, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const AdminHeader = ({ setMobileOpen, title }) => {
  const { admin } = useAuth();

  return (
    <header className="bg-[#EBE2CC] border-b border-[#CFC5B1] sticky top-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen && setMobileOpen(true)}
          className="p-2 rounded-sm text-[#34483B] hover:bg-[#DED5C1] border border-[#CFC5B1] lg:hidden"
          aria-label="Open Menu"
        >
          <FiMenu className="text-xl" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#34483B]">
          {title || 'Admin Control Panel'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#F4EFE3] px-3 py-1.5 rounded-sm border border-[#CFC5B1]">
          <div className="w-7 h-7 rounded-sm bg-[#34483B] text-[#F4EFE3] flex items-center justify-center text-xs">
            <FiUser />
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-[#34483B]">{admin?.name || 'Admin'}</span>
            <span className="block text-[10px] text-[#AD8746] font-semibold uppercase tracking-wider">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
