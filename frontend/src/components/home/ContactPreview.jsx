import React, { useContext, memo } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiSend } from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';
import GoogleMap from '../common/GoogleMap';

const ContactPreview = memo(() => {
  const { settings } = useContext(SettingContext);

  const schoolName = settings?.schoolName || 'S.S. Global Public School';
  const schoolAddress = settings?.address || 'Daudnagar, Bihar - 824143, India';
  const phone = settings?.phone || '+91 9122490003';
  const email = settings?.email || 'ssglobalpublicschool0@gmail.com';

  return (
    <section className="py-20 bg-slate-950 text-white border-t border-slate-800 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center card-hover">
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white leading-tight border-l-4 border-blue-500 pl-3">
              Visit Our School Campus in Daudnagar
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              We welcome parents and guardians to tour our smart classrooms, science labs, and sports facilities.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-start gap-3.5 text-sm text-slate-300 transition-colors hover:border-blue-500/40">
                <FiMapPin className="text-blue-400 text-xl mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-white font-serif">Campus Address</h4>
                  <p className="text-slate-300 text-xs sm:text-sm mt-0.5">{schoolAddress}</p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-start gap-3.5 text-sm text-slate-300 transition-colors hover:border-amber-400/40">
                <FiPhone className="text-amber-400 text-xl mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-white font-serif">Phone Numbers</h4>
                  <p className="text-slate-300 text-xs sm:text-sm mt-0.5">{phone} / {settings.altPhone || '+91 91234 56789'}</p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-start gap-3.5 text-sm text-slate-300 transition-colors hover:border-emerald-400/40">
                <FiMail className="text-emerald-400 text-xl mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-white font-serif">Email Address</h4>
                  <p className="text-slate-300 text-xs sm:text-sm mt-0.5 break-all">{settings.email || 'ssglobalpublicschool0@gmail.com'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                Open Full Contact Form <FiSend />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 h-80 flex flex-col bg-slate-950">
            <GoogleMap
              src={settings?.googleMapUrl}
              schoolName={schoolName}
              address={schoolAddress}
              phone={phone}
              title="S.S. Global Public School Location Map Preview"
              height="100%"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

ContactPreview.displayName = 'ContactPreview';

export default ContactPreview;
