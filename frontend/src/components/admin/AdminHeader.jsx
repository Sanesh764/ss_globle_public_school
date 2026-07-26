import React from 'react';
import { FiMenu, FiUser, FiBell } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const AdminHeader = ({ setMobileOpen, title }) => {
  const { admin } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <FiMenu className="text-2xl" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
          {title || 'Admin Control Panel'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            <FiUser />
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-slate-900">{admin?.name || 'Admin'}</span>
            <span className="block text-[10px] text-slate-500 font-medium">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
