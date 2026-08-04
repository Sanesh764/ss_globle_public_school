import React, { useContext, memo } from 'react';
import { Link } from 'react-router-dom';
import { SettingContext } from '../../context/SettingContext';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import GoogleMap from './GoogleMap';

const LocationSection = memo(() => {
  const { settings } = useContext(SettingContext);

  const schoolName = settings?.schoolName || 'S.S. Global Public School';
  const schoolAddress = settings?.address || 'Daudnagar, Bihar - 824143, India';
  const phone = settings?.phone || '+91 9122490003';
  const altPhone = settings?.altPhone;
  const email = settings?.email || 'ssglobalpublicschool0@gmail.com';
  const officeHours = settings?.officeHours || 'Monday - Saturday: 8:00 AM - 3:00 PM';

  return (
    <section className="py-16 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Side Contact Details Information Card */}
          <div className="lg:col-span-5 bg-slate-800/80 p-8 rounded-3xl border border-slate-700/80 shadow-xl space-y-6 flex flex-col justify-between card-hover">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                  GET IN TOUCH
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white border-l-4 border-blue-500 pl-3">
                  Visit Our School Campus in Daudnagar
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed pt-1">
                  Parents and visitors can reach our administrative office during working hours for admissions, prospectus, or campus tours.
                </p>
              </div>

              {/* Information Cards Stack */}
              <div className="space-y-3.5 text-sm text-slate-300 pt-2">
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 flex items-start gap-3.5 transition-colors hover:border-blue-500/40">
                  <FiMapPin className="text-blue-400 text-xl mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white font-serif">Campus Address</h4>
                    <p className="text-slate-300 text-xs sm:text-sm mt-0.5 leading-relaxed">{schoolAddress}</p>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 flex items-start gap-3.5 transition-colors hover:border-amber-400/40">
                  <FiPhone className="text-amber-400 text-xl mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white font-serif">Phone Numbers</h4>
                    <p className="text-slate-300 text-xs sm:text-sm mt-0.5">{phone}</p>
                    {altPhone && <p className="text-slate-300 text-xs sm:text-sm">{altPhone}</p>}
                  </div>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 flex items-start gap-3.5 transition-colors hover:border-emerald-400/40">
                  <FiMail className="text-emerald-400 text-xl mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white font-serif">Email Address</h4>
                    <p className="text-slate-300 text-xs sm:text-sm mt-0.5 break-all">{email}</p>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 flex items-start gap-3.5 transition-colors hover:border-purple-400/40">
                  <FiClock className="text-purple-400 text-xl mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white font-serif">Office Working Hours</h4>
                    <p className="text-slate-300 text-xs sm:text-sm mt-0.5">{officeHours}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60">
              <Link
                to="/contact"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <FiSend /> Open Full Contact Form
              </Link>
            </div>
          </div>

          {/* Right Side Google Maps Embed Component (Fully Integrated Card) */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-xl border border-slate-700/80 min-h-[380px] lg:min-h-[460px] bg-slate-950 flex flex-col">
            <GoogleMap
              src={settings?.googleMapUrl}
              schoolName={schoolName}
              address={schoolAddress}
              phone={phone}
              title="S.S. Global Public School Daudnagar Google Map Location"
              className="w-full h-full min-h-[380px] lg:min-h-[460px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

LocationSection.displayName = 'LocationSection';

export default LocationSection;
