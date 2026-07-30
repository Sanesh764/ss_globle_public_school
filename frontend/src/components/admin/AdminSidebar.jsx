import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  FiGrid,
  FiFilm,
  FiFileText,
  FiCheckSquare,
  FiUsers,
  FiImage,
  FiBell,
  FiMail,
  FiSliders,
  FiUserCheck,
  FiHome,
  FiLogOut,
  FiShield,
  FiBookOpen,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout, admin } = useAuth();

  const userRole = (admin?.role || '').toString().toLowerCase().replace(/_/g, '');
  const isSuperAdmin = userRole === 'superadmin' || userRole === 'admin';
  const isStaffAdmin = !isSuperAdmin;

  const navigationSections = [
    {
      category: null, // Dashboard top level
      staffAllowed: true,
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <FiGrid className="text-xl" />, staffAllowed: true },
      ],
    },
    {
      category: 'Content Management',
      staffAllowed: false,
      items: [
        { name: 'Hero Slider', path: '/admin/hero-slider', icon: <FiFilm className="text-xl" />, staffAllowed: false },
        { name: 'About Page', path: '/admin/about', icon: <FiFileText className="text-xl" />, staffAllowed: false },
        { name: 'Facilities', path: '/admin/facilities', icon: <FiCheckSquare className="text-xl" />, staffAllowed: false },
        { name: 'Leadership', path: '/admin/leadership', icon: <FiUsers className="text-xl" />, staffAllowed: false },
      ],
    },
    {
      category: 'Media',
      staffAllowed: true,
      items: [
        { name: 'Gallery', path: '/admin/gallery', icon: <FiImage className="text-xl" />, staffAllowed: true },
      ],
    },
    {
      category: 'Communication',
      staffAllowed: true,
      items: [
        { name: 'Notices', path: '/admin/notices', icon: <FiBell className="text-xl" />, staffAllowed: true },
        { name: 'Contact Messages', path: '/admin/messages', icon: <FiMail className="text-xl" />, staffAllowed: true },
      ],
    },
    {
      category: 'Academic',
      staffAllowed: true,
      items: [
        { name: 'Academic Resources', path: '/admin/academic-resources', icon: <FiBookOpen className="text-xl" />, staffAllowed: true },
      ],
    },
    {
      category: 'Website',
      staffAllowed: false,
      items: [
        { name: 'Website Settings', path: '/admin/settings', icon: <FiSliders className="text-xl" />, staffAllowed: false },
      ],
    },
    {
      category: 'Administration',
      staffAllowed: false,
      items: [
        { name: 'Staff Users', path: '/admin/users', icon: <FiUserCheck className="text-xl" />, staffAllowed: false },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-white flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-2xl`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl primary-gradient text-white flex items-center justify-center font-bold text-lg shadow-md">
              SS
            </div>
            <div>
              <h2 className="font-serif font-extrabold text-base text-white leading-tight">
                S.S. Global Admin
              </h2>
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <FiShield /> {isStaffAdmin ? 'Staff Portal' : 'Super Admin'}
              </span>
            </div>
          </div>

          {/* Navigation Links with Category Headers */}
          <nav className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navigationSections.map((sec, secIdx) => {
              const visibleItems = isStaffAdmin
                ? sec.items.filter((item) => item.staffAllowed)
                : sec.items;

              if (visibleItems.length === 0) return null;

              return (
                <div key={secIdx} className="space-y-1">
                  {sec.category && (
                    <h3 className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pt-2 pb-1">
                      {sec.category}
                    </h3>
                  )}

                  {visibleItems.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`
                      }
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </NavLink>
                  ))}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <FiHome className="text-lg text-amber-400" />
            <span>View Public Website</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-900/40 transition-colors"
          >
            <FiLogOut className="text-lg" />
            <span>Log Out Admin</span>
          </button>

          {admin && (
            <div className="pt-2 text-[11px] text-slate-500 text-center border-t border-slate-900">
              Logged in as <span className="text-slate-300 font-semibold">{admin.email}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
