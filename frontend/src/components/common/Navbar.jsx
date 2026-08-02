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
    { name: 'Notice Board', path: '/notices' },
    { name: 'Academic Resources', path: '/downloads' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full glass-nav transition-all duration-300 ${isScrolled ? 'shadow-xl shadow-slate-950/40 bg-slate-950/95 border-b border-slate-800' : 'bg-slate-950/85 border-b border-slate-800/60'}`}>
      {/* Top Header Contact Bar (Compact & Sleek) */}
      <div className="bg-slate-950/95 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800/60 min-h-[32px] flex items-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 w-full">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <FiMapPin className="text-amber-400 shrink-0 text-xs" /> {settings.address || 'Daudnagar, Bihar, India'}
            </span>
            <span className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
              <FiPhone className="text-amber-400 shrink-0 text-xs" /> {settings.phone || '+91 98765 43210'}
            </span>
            <span className="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors">
              <FiMail className="text-amber-400 shrink-0 text-xs" /> {settings.email || 'info@ssglobalpublicschool.edu.in'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="bg-amber-500/10 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider backdrop-blur-sm animate-pulse">
              Admissions Open 2026-27
            </span>

            {isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1 text-amber-400 font-semibold hover:text-amber-300 transition-colors text-[11px]"
              >
                <FiUserCheck className="shrink-0 text-xs" /> Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors font-medium text-[11px]"
              >
                <FiLock className="text-amber-400 shrink-0 text-xs" /> Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar (Reduced Height ~15%: h-16) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & School Name */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl primary-gradient text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/30 group-hover:scale-105 transition-all duration-300 shrink-0 border border-blue-400/20 overflow-hidden">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="S.S. Global Public School Logo"
                  width="40"
                  height="40"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                'SS'
              )}
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold font-serif tracking-tight text-white block group-hover:text-blue-400 transition-colors leading-snug">
                {settings.schoolName || 'S.S. Global Public School'}
              </span>
              <span className="text-[10px] font-semibold text-amber-400 tracking-widest uppercase block -mt-0.5">
                Daudnagar, Bihar
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Uniform Spacing & Smooth Active Indicator) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Premium Admission Open Button (Softer 16px border radius, subtle hover glow) */}
            <Link
              to="/contact"
              onClick={() => trackAdmissionClick('Navbar Desktop')}
              className="ml-3 px-4.5 py-2 rounded-[16px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/35 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
            >
              Admission Open <FiArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
            </Link>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 focus:outline-none transition-colors border border-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden glass-panel border-t border-slate-800 shadow-2xl px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-200 hover:bg-slate-800/80'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="pt-2">
            <Link
              to="/contact"
              onClick={() => {
                setIsOpen(false);
                trackAdmissionClick('Navbar Mobile');
              }}
              className="block text-center w-full px-5 py-2.5 rounded-[16px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md"
            >
              Admission Open 2026-27
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-800">
            {isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700"
              >
                Go to Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800/80"
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
