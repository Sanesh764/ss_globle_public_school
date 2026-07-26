import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';

const ContactPreview = () => {
  const { settings } = useContext(SettingContext);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-100 px-3.5 py-1 rounded-full">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 leading-tight">
              Visit Our School Campus in Daudnagar
            </h2>
            <p className="text-slate-600 text-base">
              We welcome parents and guardians to tour our smart classrooms, science labs, and sports facilities.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <FiMapPin className="text-blue-600 text-xl mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Campus Address</h4>
                  <p className="text-slate-600">{settings.address || 'Daudnagar, Bihar - 824143, India'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-slate-700">
                <FiPhone className="text-amber-500 text-xl mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Phone Numbers</h4>
                  <p className="text-slate-600">{settings.phone || '+91 98765 43210'} / {settings.altPhone || '+91 91234 56789'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-slate-700">
                <FiMail className="text-emerald-600 text-xl mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Email Address</h4>
                  <p className="text-slate-600">{settings.email || 'info@ssglobalpublicschool.edu.in'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                Open Full Contact Form <FiSend />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-lg border border-slate-300 h-80">
            <iframe
              title="S.S. Global Public School Location Map Preview"
              src={settings.googleMapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14457.942738743126!2d84.39864225!3d25.034509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398d5c89839446d3%3A0x6b19451ba21d604b!2sDaudnagar%2C%20Bihar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPreview;
