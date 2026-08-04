import React, { useState, useContext } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SEO from '../../components/common/SEO';
import LocationSection from '../../components/common/LocationSection';
import { SettingContext } from '../../context/SettingContext';
import { useToast } from '../../hooks/useToast';
import { submitContactApi } from '../../services/contactService';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';

const Contact = () => {
  const { settings } = useContext(SettingContext);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'Admission Inquiry',
    message: '',
    state: 'Bihar',
    district: 'Aurangabad',
    city: 'Daudnagar',
    pinCode: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'Contact & Admissions - S.S. Global Public School Daudnagar',
    'url': 'https://www.ssglobalpublicschool.com/contact',
    'mainEntity': {
      '@type': 'EducationalOrganization',
      'name': 'S.S. Global Public School',
      'telephone': '+919122490003',
      'email': 'ssglobalpublicschool0@gmail.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Daudnagar',
        'addressLocality': 'Daudnagar',
        'addressRegion': 'Bihar',
        'postalCode': '824143',
        'addressCountry': 'IN',
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSuccessMsg('');
      const res = await submitContactApi(formData);
      if (res.success) {
        const msg = res.message || 'Thank you! Your inquiry has been received. Our team will contact you soon.';
        setSuccessMsg(msg);
        addToast(msg, 'success');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: 'Admission Inquiry',
          message: '',
          state: 'Bihar',
          district: 'Aurangabad',
          city: 'Daudnagar',
          pinCode: '',
        });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit inquiry. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <SEO
        title="Contact Us & Admissions 2026-27 | S.S. Global Public School Daudnagar"
        description="Contact S.S. Global Public School admin office in Daudnagar, Bihar. Phone: +91 9122490003. Email: ssglobalpublicschool0@gmail.com. Submit online admission inquiries & get campus location directions."
        keywords="Contact S.S. Global Public School, S.S. Global Public School Daudnagar, Daudnagar school phone number, admission inquiry Daudnagar, school address Aurangabad Bihar"
        canonicalUrl="https://www.ssglobalpublicschool.com/contact"
        jsonLd={contactSchema}
      />
      <PageHeader
        title="Contact & Admission Inquiries"
        subtitle="Get in touch with S.S. Global Public School admin office or submit an online inquiry."
        breadcrumb={[{ label: 'Contact' }]}
      />

      <section className="py-16 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Information & Office Hours Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-800 space-y-6 card-hover">
                <h3 className="text-2xl font-bold font-serif text-white border-l-4 border-blue-500 pl-3">
                  School Administrative Office
                </h3>

                <div className="space-y-3.5 text-sm text-slate-300">
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-start gap-3.5 transition-colors hover:border-blue-500/40">
                    <FiMapPin className="text-blue-400 text-xl mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white font-serif">School Campus Address</h4>
                      <p className="text-slate-300 text-xs sm:text-sm mt-0.5 leading-relaxed">{settings.address || 'Daudnagar, Bihar - 824143, India'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-start gap-3.5 transition-colors hover:border-amber-400/40">
                    <FiPhone className="text-amber-400 text-xl mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white font-serif">Phone Numbers</h4>
                      <a href={`tel:${settings.phone || '+919122490003'}`} className="text-slate-300 hover:text-amber-300 font-semibold block text-xs sm:text-sm">
                        {settings.phone || '+91 9122490003'}
                      </a>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-start gap-3.5 transition-colors hover:border-emerald-400/40">
                    <FiMail className="text-emerald-400 text-xl mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white font-serif">Email Address</h4>
                      <a href={`mailto:${settings.email || 'ssglobalpublicschool0@gmail.com'}`} className="text-slate-300 hover:text-blue-400 font-semibold break-all block text-xs sm:text-sm">
                        {settings.email || 'ssglobalpublicschool0@gmail.com'}
                      </a>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-start gap-3.5 transition-colors hover:border-purple-400/40">
                    <FiClock className="text-purple-400 text-xl mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white font-serif">Office Working Hours</h4>
                      <p className="text-slate-300 text-xs sm:text-sm mt-0.5">{settings.officeHours || 'Monday - Saturday: 8:00 AM - 3:00 PM'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admission Note */}
              <div className="primary-gradient text-white p-6 rounded-3xl shadow-xl space-y-2 border border-blue-400/30">
                <h4 className="font-bold font-serif text-lg flex items-center gap-2">
                  <FiCheckCircle className="text-amber-400 text-xl" /> Admissions Open 2026-2027
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Parents can visit the school office during working hours to obtain the prospectus and admission registration form.
                </p>
              </div>
            </div>

            {/* Contact Inquiry Form */}
            <div className="lg:col-span-7 bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 card-hover">
              <h3 className="text-2xl font-bold font-serif text-white mb-2">
                Send Us a Direct Inquiry
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Fill out the form below and our administrative team will respond promptly.
              </p>

              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl text-emerald-300 text-sm font-semibold flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400 text-xl shrink-0" />
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9122490003"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      Inquiry Subject *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Admission Inquiry">Admission Inquiry</option>
                      <option value="Fee Structure">Fee Structure</option>
                      <option value="Transport Facility">Transport Facility</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Bihar"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Aurangabad"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      City / Village
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Daudnagar"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    PIN Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="e.g. 824143"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Your Message / Question *
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your message or questions regarding admission..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSend /> {submitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            </div>
          </div>

          {/* Location & Directions Section */}
          <LocationSection />
        </div>
      </section>
    </main>
  );
};

export default Contact;
