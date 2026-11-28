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

  return (
    <section className="py-16 sm:py-20 bg-[#EBE2CC] text-[#252821]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F4EFE3] rounded-sm p-6 sm:p-10 border border-[#CFC5B1] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>Get In Touch</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B] leading-tight">
              Visit Our School Campus in Daudnagar
            </h2>
            <p className="text-[#55594E] text-sm sm:text-base leading-relaxed">
              We welcome parents and guardians to tour our smart classrooms, science labs, and sports facilities.
            </p>

            <div className="divide-y divide-[#CFC5B1] border-t border-b border-[#CFC5B1]">
              <div className="py-3.5 flex items-start gap-3.5 text-sm">
                <FiMapPin className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">Campus Address</h4>
                  <p className="text-[#252821] text-xs sm:text-sm mt-0.5">{schoolAddress}</p>
                </div>
              </div>

              <div className="py-3.5 flex items-start gap-3.5 text-sm">
                <FiPhone className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">Phone Numbers</h4>
                  <p className="text-[#252821] text-xs sm:text-sm mt-0.5">
                    {phone} {settings.altPhone ? `/ ${settings.altPhone}` : ''}
                  </p>
                </div>
              </div>

              <div className="py-3.5 flex items-start gap-3.5 text-sm">
                <FiMail className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">Email Address</h4>
                  <p className="text-[#252821] text-xs sm:text-sm mt-0.5 break-all">
                    {settings.email || 'ssglobalpublicschool0@gmail.com'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm transition-colors"
              >
                <span>Open Full Contact Form</span>
                <FiSend className="text-[#AD8746]" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-sm overflow-hidden border border-[#CFC5B1] h-80 lg:h-96 flex flex-col bg-[#DED5C1]">
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
