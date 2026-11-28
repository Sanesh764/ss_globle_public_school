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
  FiShield,
  FiGithub
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
    { name: 'School Video Gallery', path: '/videos' },
    { name: 'Digital Notice Board', path: '/notices' },
    { name: 'Academic Resources', path: '/downloads' },
    { name: 'Contact & Admissions', path: '/contact' },
  ];

  const schoolName = settings?.schoolName || 'S.S. Global Public School';
  const schoolAddress = settings?.address || 'Daudnagar, Bihar - 824143, India';
  const phone = settings?.phone || '+91 9122490003';
  const logoSrc = settings?.logo || '/logo.webp';

  return (
    <footer className="bg-[#27372D] text-[#EBE2CC] pt-16 pb-8 border-t-4 border-[#AD8746] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 4-Column Institutional Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#3F5547]">
          {/* Column 1: School Identity & Social Media */}
          <div className="lg:col-span-3 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-sm bg-[#F4EFE3] border border-[#AD8746]/50 p-1 flex items-center justify-center shrink-0">
                <img
                  src={logoSrc}
                  alt={`${schoolName} Logo`}
                  width="48"
                  height="48"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo.jpg';
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-[#F4EFE3] tracking-tight leading-snug">
                  {schoolName}
                </h3>
                <span className="text-[10px] font-semibold text-[#AD8746] uppercase tracking-[0.16em] block mt-0.5">
                  CBSE Affiliated Institution
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#EBE2CC]/80 leading-relaxed">
              {settings?.tagline ||
                'Empowering young minds through quality CBSE education, interactive smart classrooms, modern laboratories, sports, and holistic character development in Daudnagar, Bihar.'}
            </p>

            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AD8746] block">
                Connect With Us
              </span>
              <div className="flex items-center space-x-2">
                <a
                  href={settings?.socialLinks?.facebook || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Facebook Page"
                  className="w-9 h-9 rounded-sm bg-[#34483B] border border-[#4B6353] text-[#EBE2CC] hover:text-white hover:border-[#AD8746] flex items-center justify-center transition-colors"
                >
                  <FiFacebook className="text-sm" />
                </a>
                <a
                  href={settings?.socialLinks?.instagram || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Instagram Profile"
                  className="w-9 h-9 rounded-sm bg-[#34483B] border border-[#4B6353] text-[#EBE2CC] hover:text-white hover:border-[#AD8746] flex items-center justify-center transition-colors"
                >
                  <FiInstagram className="text-sm" />
                </a>
                <a
                  href={settings?.socialLinks?.twitter || 'https://twitter.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Twitter Handle"
                  className="w-9 h-9 rounded-sm bg-[#34483B] border border-[#4B6353] text-[#EBE2CC] hover:text-white hover:border-[#AD8746] flex items-center justify-center transition-colors"
                >
                  <FiTwitter className="text-sm" />
                </a>
                <a
                  href={settings?.socialLinks?.youtube || 'https://youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official YouTube Channel"
                  className="w-9 h-9 rounded-sm bg-[#34483B] border border-[#4B6353] text-[#EBE2CC] hover:text-white hover:border-[#AD8746] flex items-center justify-center transition-colors"
                >
                  <FiYoutube className="text-sm" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[#F4EFE3] text-sm font-bold font-serif uppercase tracking-wider border-l-2 border-[#AD8746] pl-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 text-[#EBE2CC]/80 hover:text-[#F4EFE3] transition-colors py-0.5"
                  >
                    <FiChevronRight className="text-[#AD8746] text-xs transition-transform group-hover:translate-x-0.5 shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: School Contact Details */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[#F4EFE3] text-sm font-bold font-serif uppercase tracking-wider border-l-2 border-[#AD8746] pl-3">
              School Contact
            </h4>
            <div className="space-y-3 text-xs">
              <div className="bg-[#34483B]/70 p-3 rounded-sm border border-[#4B6353] flex items-start gap-3">
                <FiMapPin className="text-[#AD8746] text-base shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-[#F4EFE3] text-[11px] uppercase tracking-wider">Campus Address</h5>
                  <p className="mt-0.5 text-[#EBE2CC]/85 leading-snug">{schoolAddress}</p>
                </div>
              </div>

              <div className="bg-[#34483B]/70 p-3 rounded-sm border border-[#4B6353] flex items-start gap-3">
                <FiPhone className="text-[#AD8746] text-base shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-[#F4EFE3] text-[11px] uppercase tracking-wider">Phone Numbers</h5>
                  <p className="mt-0.5 text-[#EBE2CC]/85">{phone}</p>
                </div>
              </div>

              <div className="bg-[#34483B]/70 p-3 rounded-sm border border-[#4B6353] flex items-start gap-3">
                <FiMail className="text-[#AD8746] text-base shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-[#F4EFE3] text-[11px] uppercase tracking-wider">Email Address</h5>
                  <p className="mt-0.5 text-[#EBE2CC]/85 break-all">{settings?.email || 'ssglobalpublicschool0@gmail.com'}</p>
                </div>
              </div>

              <div className="bg-[#34483B]/70 p-3 rounded-sm border border-[#4B6353] flex items-start gap-3">
                <FiClock className="text-[#AD8746] text-base shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-[#F4EFE3] text-[11px] uppercase tracking-wider">Office Hours</h5>
                  <p className="mt-0.5 text-[#EBE2CC]/85">{settings?.officeHours || 'Mon - Sat: 8:00 AM - 3:00 PM'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Location Map */}
          <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
            <h4 className="text-[#F4EFE3] text-sm font-bold font-serif uppercase tracking-wider border-l-2 border-[#AD8746] pl-3">
              Campus Map
            </h4>
            <div className="flex-1 min-h-[250px] rounded-sm overflow-hidden border border-[#4B6353]">
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

        {/* Bottom Copyright & Accreditation Row */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-[#EBE2CC]/75 gap-4 pt-1">
          <p className="text-center md:text-left font-normal flex flex-wrap items-center justify-center md:justify-start gap-1.5">
            <span>© 2026 <span className="text-[#F4EFE3] font-semibold">{schoolName}</span>, Daudnagar. All Rights Reserved.</span>
            <span className="hidden sm:inline text-[#4B6353]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              Designed &amp; Developed by{' '}
              <a
                href="https://github.com/Sanesh764"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F4EFE3] hover:text-[#AD8746] transition-colors font-medium inline-flex items-center gap-1"
              >
                <FiGithub className="text-xs text-[#AD8746]" />
                <span>Sanesh Kumar</span>
              </a>
            </span>
          </p>

          <div className="flex items-center flex-wrap justify-center gap-2.5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-[#F4EFE3] font-medium bg-[#34483B] px-2.5 py-1 rounded-sm border border-[#4B6353]">
              <FiShield className="text-[#AD8746] text-xs" /> CBSE Affiliated
            </span>
            <span className="text-[#4B6353]">•</span>
            <Link to="/contact" className="hover:text-[#F4EFE3] transition-colors">Privacy Policy</Link>
            <span className="text-[#4B6353]">•</span>
            <Link to="/contact" className="hover:text-[#F4EFE3] transition-colors">Terms of Service</Link>
            <span className="text-[#4B6353]">•</span>
            <Link
              to="/admin/login"
              className="text-[#AD8746] hover:text-[#F4EFE3] font-semibold underline underline-offset-2 transition-colors"
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
