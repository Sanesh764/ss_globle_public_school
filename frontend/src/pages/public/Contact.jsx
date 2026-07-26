import React, { useState, useContext } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { SettingContext } from '../../context/SettingContext';
import { useToast } from '../../hooks/useToast';
import { submitContactApi } from '../../services/contactService';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';

const Contact = () => {
  const { settings } = useContext(SettingContext);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Admission Inquiry',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await submitContactApi(formData);
      if (res.success) {
        addToast(res.message || 'Your inquiry has been submitted successfully!', 'success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Admission Inquiry',
          message: '',
        });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit form. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Contact & Admission Inquiries"
        subtitle="Get in touch with S.S. Global Public School admin office or submit an online inquiry."
        breadcrumb={[{ label: 'Contact' }]}
      />

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Information & Office Hours Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-2xl font-bold font-serif text-slate-900 border-l-4 border-blue-600 pl-3">
                  School Administrative Office
                </h3>

                <div className="space-y-4 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="text-blue-600 text-xl mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900">School Campus Address</h4>
                      <p className="text-slate-600">{settings.address || 'Daudnagar, Bihar - 824143, India'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiPhone className="text-amber-500 text-xl mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900">Phone Numbers</h4>
                      <p className="text-slate-600">{settings.phone || '+91 98765 43210'}</p>
                      {settings.altPhone && <p className="text-slate-600">{settings.altPhone}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiMail className="text-emerald-600 text-xl mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900">Email Address</h4>
                      <p className="text-slate-600 break-all">{settings.email || 'info@ssglobalpublicschool.edu.in'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiClock className="text-purple-600 text-xl mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900">Office Working Hours</h4>
                      <p className="text-slate-600">{settings.officeHours || 'Monday - Saturday: 8:00 AM - 3:00 PM'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admission Note */}
              <div className="primary-gradient text-white p-6 rounded-3xl shadow-md space-y-2">
                <h4 className="font-bold font-serif text-lg flex items-center gap-2">
                  <FiCheckCircle className="text-amber-400" /> Admissions Open 2026-2027
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Parents can visit the school office during working hours to obtain the prospectus and admission registration form.
                </p>
              </div>
            </div>

            {/* Contact Form (Stored in MongoDB) */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold font-serif text-slate-900 mb-2">
                Send Us a Direct Inquiry
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Fill out the form below and our administrative team will respond promptly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Inquiry Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Admission Inquiry">Admission Inquiry</option>
                      <option value="Fee Structure">Fee Structure</option>
                      <option value="Transport Facility">Transport Facility</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Message / Question *
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your message or questions regarding admission..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSend /> {submitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Google Map Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold font-serif text-slate-900">
              Interactive School Location Map (Daudnagar, Bihar)
            </h3>
            <div className="rounded-2xl overflow-hidden shadow-inner h-96">
              <iframe
                title="S.S. Global Public School Google Map Location"
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
    </div>
  );
};

export default Contact;
