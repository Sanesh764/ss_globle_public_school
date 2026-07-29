import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiClock, FiExternalLink, FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiArrowUpRight } from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';

const Footer = () => {
  const { settings } = useContext(SettingContext);

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About School', path: '/about' },
    { name: 'Facilities & Infrastructure', path: '/facilities' },
    { name: 'Photo Gallery', path: '/gallery' },
    { name: 'Notice Board', path: '/notices' },
    { name: 'Contact & Admissions', path: '/contact' },
    { name: 'Admin Portal', path: '/admin/login' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl primary-gradient text-white flex items-center justify-center font-bold text-lg shadow-md">
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt="S.S. Global Public School Logo"
                    width="40"
                    height="40"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  'SS'
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif tracking-tight">
                  {settings.schoolName || 'S.S. Global Public School'}
                </h3>
                <p className="text-xs text-amber-400 font-medium">Daudnagar, Bihar</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.tagline || 'Empowering minds and shaping future leaders through quality CBSE education, modern smart classrooms, and strong moral values.'}
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a href={settings.socialLinks?.facebook || 'https://facebook.com'} target="_blank" rel="noopener noreferrer" aria-label="Official Facebook Page" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                <FiFacebook />
              </a>
              <a href={settings.socialLinks?.instagram || 'https://instagram.com'} target="_blank" rel="noopener noreferrer" aria-label="Official Instagram Profile" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                <FiInstagram />
              </a>
              <a href={settings.socialLinks?.twitter || 'https://twitter.com'} target="_blank" rel="noopener noreferrer" aria-label="Official Twitter Handle" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                <FiTwitter />
              </a>
              <a href={settings.socialLinks?.youtube || 'https://youtube.com'} target="_blank" rel="noopener noreferrer" aria-label="Official YouTube Channel" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                <FiYoutube />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white text-base font-bold mb-4 font-serif uppercase tracking-wider border-l-4 border-amber-400 pl-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-1 duration-200">
                    <FiArrowUpRight className="text-amber-500 text-xs" /> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div>
            <h4 className="text-white text-base font-bold mb-4 font-serif uppercase tracking-wider border-l-4 border-blue-500 pl-3">
              School Contact
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-amber-400 text-lg mt-0.5 shrink-0" />
                <span>{settings.address || 'Daudnagar, Bihar - 824143, India'}</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-amber-400 text-base shrink-0" />
                <span>{settings.phone || '+91 98765 43210'}</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-amber-400 text-base shrink-0" />
                <span className="break-all">{settings.email || 'info@ssglobalpublicschool.edu.in'}</span>
              </li>
              <li className="flex items-center gap-3">
                <FiClock className="text-amber-400 text-base shrink-0" />
                <span>{settings.officeHours || 'Mon - Sat: 8:00 AM - 3:00 PM'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Location Map & Direct Link */}
          <div>
            <h4 className="text-white text-base font-bold mb-4 font-serif uppercase tracking-wider border-l-4 border-emerald-500 pl-3">
              Location Map
            </h4>
            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-md bg-slate-900">
              <iframe
                title="S.S. Global Public School Location Map"
                src={settings.googleMapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14457.942738743126!2d84.39864225!3d25.034509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398d5c89839446d3%3A0x6b19451ba21d604b!2sDaudnagar%2C%20Bihar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'}
                width="100%"
                height="130"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <a
              href="https://maps.google.com/?q=Daudnagar+Bihar"
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Open in Google Maps <FiExternalLink />
            </a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {settings.schoolName || 'S.S. Global Public School'}, Daudnagar. All Rights Reserved.</p>
          <p className="flex items-center gap-2">
            <span>CBSE Curriculum School</span>
            <span>•</span>
            <Link to="/admin/login" className="hover:text-slate-300 underline">Admin Login</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
