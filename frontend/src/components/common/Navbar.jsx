import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiLock, FiPhone, FiMail, FiMapPin, FiUserCheck, FiArrowRight } from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';
import { AuthContext } from '../../context/AuthContext';
import { trackAdmissionClick } from '../../utils/analytics';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { settings } = useContext(SettingContext);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Facilities', path: '/facilities' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Video Gallery', path: '/videos' },
    { name: 'Notice Board', path: '/notices' },
    { name: 'Academic Resources', path: '/downloads' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F4EFE3]/98 shadow-sm border-b border-[#CFC5B1]'
          : 'bg-[#F4EFE3] border-b border-[#CFC5B1]'
      }`}
    >
      {/* Top Institutional Information Bar */}
      <div className="bg-[#34483B] text-[#EBE2CC] text-[11px] py-1.5 px-3 sm:px-4 border-b border-[#27372D]">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-2 w-full">
          <div className="flex items-center space-x-4">
            <a
              href={`tel:${settings.phone || '+919122490003'}`}
              className="hover:text-white transition-colors flex items-center gap-1.5 text-[11px] font-medium"
            >
              <FiPhone className="text-[#AD8746] shrink-0 text-xs" />
              <span>{settings.phone || '+91 9122490003'}</span>
            </a>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[#EBE2CC]/90">
              <FiMapPin className="text-[#AD8746] shrink-0 text-xs" />
              <span>{settings.address || 'Daudnagar, Bihar, India'}</span>
            </span>
            <a
              href={`mailto:${settings.email || 'ssglobalpublicschool0@gmail.com'}`}
              className="hidden lg:flex hover:text-white transition-colors items-center gap-1.5"
            >
              <FiMail className="text-[#AD8746] shrink-0 text-xs" />
              <span>{settings.email || 'ssglobalpublicschool0@gmail.com'}</span>
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden xs:inline-block sm:inline-block text-[#EBE2CC] border-r border-[#4B6353] pr-3 text-[10px] font-semibold tracking-widest uppercase">
              Admissions Open 2026–27
            </span>

            {isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 text-[#EBE2CC] font-semibold hover:text-white transition-colors text-[11px]"
              >
                <FiUserCheck className="text-[#AD8746] shrink-0 text-xs" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 text-[#EBE2CC]/90 hover:text-white transition-colors font-medium text-[11px]"
              >
                <FiLock className="text-[#AD8746] shrink-0 text-xs" />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[70px]">
          {/* School Branding Block */}
          <div className="flex items-center shrink-0 pr-3 lg:pr-5 xl:pr-6 lg:border-r border-[#CFC5B1]">
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-11 h-11 rounded-sm bg-[#EBE2CC] border border-[#CFC5B1] p-0.5 flex items-center justify-center font-serif font-bold text-lg text-[#34483B] shrink-0 overflow-hidden transition-colors group-hover:border-[#AD8746]">
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt="S.S. Global Public School Logo"
                    width="44"
                    height="44"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  'SS'
                )}
              </div>
              <div className="flex flex-col shrink-0">
                <span className="text-base sm:text-lg xl:text-[19px] font-bold font-serif tracking-tight text-[#34483B] block group-hover:text-[#27372D] transition-colors leading-tight whitespace-nowrap">
                  {settings.schoolName || 'S.S. Global Public School'}
                </span>
                <span className="text-[10px] font-semibold text-[#AD8746] tracking-[0.16em] uppercase block mt-0.5 whitespace-nowrap">
                  Daudnagar, Bihar
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center ml-auto shrink-0 space-x-1 xl:space-x-2">
            <nav className="flex items-center space-x-0.5 xl:space-x-1 shrink-0" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-2 py-2 xl:px-2.5 2xl:px-3 text-[11px] lg:text-[12px] xl:text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors duration-200 border-b-2 ${
                      isActive
                        ? 'text-[#34483B] font-semibold border-[#AD8746]'
                        : 'text-[#252821] border-transparent hover:text-[#34483B] hover:border-[#CFC5B1]'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Refined Admissions CTA */}
            <Link
              to="/register"
              onClick={() => trackAdmissionClick('Navbar Desktop')}
              className="ml-2 xl:ml-3 px-4 py-2 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-[11px] lg:text-[12px] xl:text-xs tracking-wide transition-colors duration-200 flex items-center gap-1.5 shrink-0 whitespace-nowrap border border-[#34483B]"
            >
              <span>Admission Open</span>
              <FiArrowRight className="text-xs text-[#AD8746] shrink-0" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-sm text-[#34483B] hover:bg-[#EBE2CC] focus:outline-none transition-colors border border-[#CFC5B1]"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-[#F4EFE3] border-t border-[#CFC5B1] px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors border-l-2 ${
                  isActive
                    ? 'bg-[#EBE2CC] text-[#34483B] font-semibold border-[#AD8746]'
                    : 'text-[#252821] border-transparent hover:bg-[#EBE2CC]/60'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="pt-3 mt-2 border-t border-[#CFC5B1] space-y-2">
            <Link
              to="/register"
              onClick={() => {
                setIsOpen(false);
                trackAdmissionClick('Navbar Mobile');
              }}
              className="block text-center w-full px-5 py-2.5 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm tracking-wide transition-colors"
            >
              Admission Open 2026–27
            </Link>

            {isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full px-4 py-2 rounded-sm bg-[#EBE2CC] text-[#34483B] font-semibold text-xs border border-[#CFC5B1]"
              >
                Go to Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full px-4 py-2 rounded-sm border border-[#CFC5B1] text-[#252821] font-medium text-xs hover:bg-[#EBE2CC]"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
