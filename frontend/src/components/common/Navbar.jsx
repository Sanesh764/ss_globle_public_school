import React, { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiLock, FiPhone, FiMail, FiMapPin, FiUserCheck } from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useContext(SettingContext);
  const { isAuthenticated } = useContext(AuthContext);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Facilities', path: '/facilities' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Notice Board', path: '/notices' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-md bg-white">
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <FiMapPin className="text-amber-400" /> {settings.address || 'Daudnagar, Bihar, India'}
            </span>
            <span className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
              <FiPhone className="text-amber-400" /> {settings.phone || '+91 98765 43210'}
            </span>
            <span className="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors">
              <FiMail className="text-amber-400" /> {settings.email || 'info@ssglobalpublicschool.edu.in'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-semibold animate-pulse">
              Admissions Open 2026-27
            </span>

            {isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1 text-amber-400 font-semibold hover:underline"
              >
                <FiUserCheck /> Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors font-medium"
              >
                <FiLock className="text-amber-400" /> Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & School Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl primary-gradient text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                'SS'
              )}
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold font-serif tracking-tight text-slate-900 block group-hover:text-blue-600 transition-colors">
                {settings.schoolName || 'S.S. Global Public School'}
              </span>
              <span className="text-xs font-semibold text-amber-600 tracking-widest uppercase block -mt-0.5">
                Daudnagar, Bihar
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold shadow-sm'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <Link
              to="/contact"
              className="ml-4 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Admission Open
            </Link>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-800 hover:bg-slate-100'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="pt-2">
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block text-center w-full px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md"
            >
              Admission Open 2026-27
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm"
              >
                Go to Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50"
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
