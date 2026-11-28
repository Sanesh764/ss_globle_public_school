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
    <section className="py-12 bg-[#EBE2CC] border border-[#CFC5B1] rounded-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Side Contact Details */}
          <div className="lg:col-span-5 bg-[#F4EFE3] p-7 sm:p-8 rounded-sm border border-[#CFC5B1] flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746] block mb-2">
                  Get In Touch
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#34483B] leading-snug">
                  Visit Our School Campus in Daudnagar
                </h2>
                <p className="text-[#55594E] text-sm leading-relaxed mt-2">
                  Parents and visitors can reach our administrative office during working hours for admissions, prospectus, or campus tours.
                </p>
              </div>

              <div className="divide-y divide-[#CFC5B1] border-t border-b border-[#CFC5B1] text-sm">
                <div className="py-3.5 flex items-start gap-3.5">
                  <FiMapPin className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">Campus Address</h4>
                    <p className="text-[#252821] text-xs sm:text-sm mt-0.5 leading-relaxed">{schoolAddress}</p>
                  </div>
                </div>

                <div className="py-3.5 flex items-start gap-3.5">
                  <FiPhone className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">Phone Numbers</h4>
                    <p className="text-[#252821] text-xs sm:text-sm mt-0.5">{phone}</p>
                    {altPhone && <p className="text-[#252821] text-xs sm:text-sm">{altPhone}</p>}
                  </div>
                </div>

                <div className="py-3.5 flex items-start gap-3.5">
                  <FiMail className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">Email Address</h4>
                    <p className="text-[#252821] text-xs sm:text-sm mt-0.5 break-all">{email}</p>
                  </div>
                </div>

                <div className="py-3.5 flex items-start gap-3.5">
                  <FiClock className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">Office Working Hours</h4>
                    <p className="text-[#252821] text-xs sm:text-sm mt-0.5">{officeHours}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/contact"
                className="w-full py-3 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm rounded-sm transition-colors flex items-center justify-center gap-2"
              >
                <FiSend className="text-[#AD8746]" /> Open Full Contact Form
              </Link>
            </div>
          </div>

          {/* Right Side Google Maps Embed */}
          <div className="lg:col-span-7 rounded-sm overflow-hidden border border-[#CFC5B1] min-h-[380px] lg:min-h-[460px] bg-[#DED5C1] flex flex-col">
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
