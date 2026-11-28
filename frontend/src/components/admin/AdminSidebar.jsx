import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  FiGrid,
  FiFilm,
  FiFileText,
  FiCheckSquare,
  FiUsers,
  FiImage,
  FiVideo,
  FiBell,
  FiMail,
  FiSliders,
  FiUserCheck,
  FiHome,
  FiLogOut,
  FiShield,
  FiBookOpen,
  FiClipboard,
  FiUser,
  FiCalendar,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout, admin } = useAuth();

  const userRole = (admin?.role || '').toString().toLowerCase().replace(/_/g, '');
  const isSuperAdmin = userRole === 'superadmin' || userRole === 'admin';
  const isStaffAdmin = !isSuperAdmin;

  const navigationSections = [
    {
      category: null,
      staffAllowed: true,
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <FiGrid className="text-lg" />, staffAllowed: true },
      ],
    },
    {
      category: 'Content Management',
      staffAllowed: false,
      items: [
        { name: 'Hero Slider', path: '/admin/hero-slider', icon: <FiFilm className="text-lg" />, staffAllowed: false },
        { name: 'About Page', path: '/admin/about', icon: <FiFileText className="text-lg" />, staffAllowed: false },
        { name: 'Facilities', path: '/admin/facilities', icon: <FiCheckSquare className="text-lg" />, staffAllowed: false },
        { name: 'Leadership', path: '/admin/leadership', icon: <FiUsers className="text-lg" />, staffAllowed: false },
      ],
    },
    {
      category: 'Media',
      staffAllowed: true,
      items: [
        { name: 'Photo Gallery', path: '/admin/gallery', icon: <FiImage className="text-lg" />, staffAllowed: true },
        { name: 'Video Gallery', path: '/admin/videos', icon: <FiVideo className="text-lg" />, staffAllowed: true },
      ],
    },
    {
      category: 'Communication',
      staffAllowed: true,
      items: [
        { name: 'Notices', path: '/admin/notices', icon: <FiBell className="text-lg" />, staffAllowed: true },
        { name: 'Contact Messages', path: '/admin/messages', icon: <FiMail className="text-lg" />, staffAllowed: true },
      ],
    },
    {
      category: 'Academic',
      staffAllowed: true,
      items: [
        { name: 'Student Applications', path: '/admin/applications', icon: <FiClipboard className="text-lg" />, staffAllowed: true },
        { name: 'Students', path: '/admin/students', icon: <FiUsers className="text-lg" />, staffAllowed: true },
        { name: 'Attendance', path: '/admin/attendance', icon: <FiCalendar className="text-lg" />, staffAllowed: true },
        { name: 'Academic Resources', path: '/admin/academic-resources', icon: <FiBookOpen className="text-lg" />, staffAllowed: true },
      ],
    },
    {
      category: 'Website',
      staffAllowed: false,
      items: [
        { name: 'Website Settings', path: '/admin/settings', icon: <FiSliders className="text-lg" />, staffAllowed: false },
      ],
    },
    {
      category: 'Administration',
      staffAllowed: false,
      items: [
        { name: 'My Profile', path: '/admin/profile', icon: <FiUser className="text-lg" />, staffAllowed: false },
        { name: 'Staff Users', path: '/admin/users', icon: <FiUserCheck className="text-lg" />, staffAllowed: false },
      ],
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#252821]/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#27372D] text-[#EBE2CC] flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#3F5547]`}
      >
        <div>
          <div className="p-5 border-b border-[#3F5547] flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#F4EFE3] text-[#34483B] border border-[#AD8746] flex items-center justify-center font-serif font-bold text-base">
              SS
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#F4EFE3] leading-tight">
                S.S. Global Admin
              </h2>
              <span className="text-[11px] text-[#AD8746] font-semibold flex items-center gap-1 mt-0.5">
                <FiShield className="text-xs" /> {isStaffAdmin ? 'Staff Portal' : 'Super Admin'}
              </span>
            </div>
          </div>

          <nav className="p-3.5 space-y-3.5 overflow-y-auto max-h-[calc(100vh-205px)]">
            {navigationSections.map((sec, secIdx) => {
              const visibleItems = isStaffAdmin
                ? sec.items.filter((item) => item.staffAllowed)
                : sec.items;

              if (visibleItems.length === 0) return null;

              return (
                <div key={secIdx} className="space-y-1">
                  {sec.category && (
                    <h3 className="px-3 text-[10px] font-semibold text-[#AD8746] uppercase tracking-[0.16em] pt-2 pb-1">
                      {sec.category}
                    </h3>
                  )}

                  {visibleItems.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2 rounded-sm text-xs font-medium transition-colors border-l-2 ${
                          isActive
                            ? 'bg-[#34483B] text-[#F4EFE3] border-[#AD8746] font-semibold'
                            : 'text-[#EBE2CC]/80 border-transparent hover:text-[#F4EFE3] hover:bg-[#34483B]/50'
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

        <div className="p-3.5 border-t border-[#3F5547] space-y-1.5">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2 rounded-sm text-xs font-medium text-[#EBE2CC]/90 hover:text-white hover:bg-[#34483B]/60 transition-colors"
          >
            <FiHome className="text-base text-[#AD8746]" />
            <span>View Public Website</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3.5 py-2 rounded-sm text-xs font-semibold text-[#E8A598] hover:text-white hover:bg-[#7F2E2E]/60 transition-colors"
          >
            <FiLogOut className="text-base" />
            <span>Log Out Admin</span>
          </button>

          {admin && (
            <div className="pt-2 text-[11px] text-[#EBE2CC]/70 text-center border-t border-[#3F5547] truncate">
              Signed in as <span className="text-[#F4EFE3] font-medium">{admin.email}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
