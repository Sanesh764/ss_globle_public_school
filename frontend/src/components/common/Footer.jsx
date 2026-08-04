import React, { useContext, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiChevronRight,
  FiShield
} from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';
import GoogleMap from './GoogleMap';

const Footer = memo(() => {
  const { settings } = useContext(SettingContext);

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About School', path: '/about' },
    { name: 'Facilities & Infrastructure', path: '/facilities' },
    { name: 'Photo & Event Gallery', path: '/gallery' },
    { name: 'Digital Notice Board', path: '/notices' },
    { name: 'Academic Resources', path: '/downloads' },
    { name: 'Contact & Admissions', path: '/contact' },
  ];

  const schoolName = settings?.schoolName || 'S.S. Global Public School';
  const schoolAddress = settings?.address || 'Daudnagar, Bihar - 824143, India';
  const phone = settings?.phone || '+91 9122490003';
  const logoSrc = settings?.logo || '/logo.webp';

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 sm:pt-20 pb-8 border-t border-slate-800 relative overflow-hidden hero-gradient font-sans">
      {/* Soft Ambient Background Glow Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Column 1: School Identity & Social Media */}
          <div className="lg:col-span-3 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 p-1 shadow-xl shadow-blue-950/40 flex items-center justify-center shrink-0 group hover:scale-105 transition-transform duration-300">
                <img
                  src={logoSrc}
                  alt={`${schoolName} Logo`}
                  width="48"
                  height="48"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo.jpg';
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-white tracking-tight leading-snug">
                  {schoolName}
                </h3>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mt-0.5">
                  CBSE Affiliated Institution
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              {settings?.tagline ||
                'Empowering young minds through quality CBSE education, interactive smart classrooms, modern laboratories, sports, and holistic character development in Daudnagar, Bihar.'}
            </p>

            {/* Social Media Glassmorphism Icon Buttons */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Connect With Us
              </span>
              <div className="flex items-center space-x-2.5">
                <a
                  href={settings?.socialLinks?.facebook || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Facebook Page"
                  className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 shadow-md hover:shadow-blue-600/30 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <FiFacebook className="text-sm" />
                </a>
                <a
                  href={settings?.socialLinks?.instagram || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Instagram Profile"
                  className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-pink-600 hover:border-pink-500 shadow-md hover:shadow-pink-600/30 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <FiInstagram className="text-sm" />
                </a>
                <a
                  href={settings?.socialLinks?.twitter || 'https://twitter.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Twitter Handle"
                  className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-sky-500 hover:border-sky-400 shadow-md hover:shadow-sky-500/30 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <FiTwitter className="text-sm" />
                </a>
                <a
                  href={settings?.socialLinks?.youtube || 'https://youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official YouTube Channel"
                  className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-red-600 hover:border-red-500 shadow-md hover:shadow-red-600/30 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <FiYoutube className="text-sm" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white text-base font-bold font-serif uppercase tracking-wider border-l-4 border-amber-400 pl-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 text-slate-400 hover:text-amber-300 transition-colors duration-200 py-0.5"
                  >
                    <FiChevronRight className="text-amber-400 text-xs transition-transform group-hover:translate-x-1 shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: School Contact Cards */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white text-base font-bold font-serif uppercase tracking-wider border-l-4 border-blue-500 pl-3">
              School Contact
            </h4>
            <div className="space-y-2.5">
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-colors flex items-start gap-3 text-xs text-slate-300 card-hover">
                <FiMapPin className="text-amber-400 text-base shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-[11px] font-serif uppercase tracking-wider">Campus Address</h5>
                  <p className="mt-0.5 text-slate-300 leading-snug">{schoolAddress}</p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 hover:border-amber-400/40 transition-colors flex items-start gap-3 text-xs text-slate-300 card-hover">
                <FiPhone className="text-amber-400 text-base shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-[11px] font-serif uppercase tracking-wider">Phone Numbers</h5>
                  <p className="mt-0.5 text-slate-300">{phone}</p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 hover:border-emerald-400/40 transition-colors flex items-start gap-3 text-xs text-slate-300 card-hover">
                <FiMail className="text-emerald-400 text-base shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-[11px] font-serif uppercase tracking-wider">Email Address</h5>
                  <p className="mt-0.5 text-slate-300 break-all">{settings?.email || 'ssglobalpublicschool0@gmail.com'}</p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 hover:border-purple-400/40 transition-colors flex items-start gap-3 text-xs text-slate-300 card-hover">
                <FiClock className="text-purple-400 text-base shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-[11px] font-serif uppercase tracking-wider">Office Hours</h5>
                  <p className="mt-0.5 text-slate-300">{settings?.officeHours || 'Mon - Sat: 8:00 AM - 3:00 PM'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Location Map Embed (Expanded & Integrated) */}
          <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
            <h4 className="text-white text-base font-bold font-serif uppercase tracking-wider border-l-4 border-emerald-500 pl-3">
              Campus Map
            </h4>
            <div className="flex-1 min-h-[260px]">
              <GoogleMap
                src={settings?.googleMapUrl}
                schoolName={schoolName}
                address={schoolAddress}
                phone={phone}
                title="S.S. Global Public School Location Map"
                height="100%"
              />
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Accreditation Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4 pt-2">
          <p className="text-center md:text-left font-medium">
            © 2026 <span className="text-white font-semibold">{schoolName}</span>, Daudnagar. All Rights Reserved.
          </p>

          <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-slate-300 font-semibold bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              <FiShield className="text-emerald-400 text-xs" /> CBSE Affiliated
            </span>
            <span className="text-slate-600">•</span>
            <Link to="/contact" className="hover:text-amber-300 transition-colors">Privacy Policy</Link>
            <span className="text-slate-600">•</span>
            <Link to="/contact" className="hover:text-amber-300 transition-colors">Terms of Service</Link>
            <span className="text-slate-600">•</span>
            <Link
              to="/admin/login"
              className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
