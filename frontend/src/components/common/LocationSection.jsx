import React, { useContext, memo } from 'react';
import { Link } from 'react-router-dom';
import { SettingContext } from '../../context/SettingContext';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import GoogleMap from './GoogleMap';

const LocationSection = memo(() => {
  const { settings } = useContext(SettingContext);

  const schoolAddress =
    settings?.address || 'Sambhu Nagar, Near Teacher Training College, Daudnagar, Bihar - 824143, India';
  const phone = settings?.phone || '+91 98765 43210';
  const altPhone = settings?.altPhone;
  const email = settings?.email || 'info@ssglobalpublicschool.edu.in';
  const officeHours = settings?.officeHours || 'Monday - Saturday: 8:00 AM - 3:00 PM';
  const schoolName = settings?.schoolName || 'S.S. Global Public School';

  return (
    <section className="py-16 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Side Contact Details */}
          <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-200 px-3 py-1 rounded-full inline-block">
                  GET IN TOUCH
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 border-l-4 border-blue-600 pl-3">
                  Visit Our School Campus in Daudnagar
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed pt-1">
                  Parents and visitors can reach our administrative office during working hours for admissions, prospectus, or campus tours.
                </p>
              </div>

              <div className="space-y-4 text-sm text-slate-700 pt-2">
                <div className="flex items-start gap-3">
                  <FiMapPin className="text-blue-600 text-xl mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900">Campus Address</h4>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{schoolAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiPhone className="text-amber-500 text-xl mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900">Phone Numbers</h4>
                    <p className="text-slate-600 mt-0.5">{phone}</p>
                    {altPhone && <p className="text-slate-600">{altPhone}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiMail className="text-emerald-600 text-xl mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900">Email Address</h4>
                    <p className="text-slate-600 mt-0.5 break-all">{email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiClock className="text-purple-600 text-xl mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900">Office Working Hours</h4>
                    <p className="text-slate-600 mt-0.5">{officeHours}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/contact"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FiSend /> Open Full Contact Form
              </Link>
            </div>
          </div>

          {/* Right Side Google Maps Embed Component */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-sm border border-slate-200 min-h-[380px] lg:min-h-[460px] bg-slate-100 flex flex-col">
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
