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
    'name': 'Contact & Admissions - S.S. Global Public School',
    'url': 'https://ssglobalpublicschool.com/contact',
    'mainEntity': {
      '@type': 'EducationalOrganization',
      'name': 'S.S. Global Public School',
      'telephone': '+919876543210',
      'email': 'info@ssglobalpublicschool.edu.in',
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
        title="Contact Us & Admissions 2026-27 | S.S. Global Public School"
        description="Contact S.S. Global Public School admin office in Daudnagar, Bihar. Phone: +91 98765 43210. Submit online admission inquiries & get campus location directions."
        keywords="Contact S.S. Global Public School, Daudnagar school phone number, admission inquiry Daudnagar, school address Aurangabad Bihar"
        canonicalUrl="https://ssglobalpublicschool.com/contact"
        jsonLd={contactSchema}
      />
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
                      <a href={`tel:${settings.phone || '+919876543210'}`} className="text-slate-600 hover:text-blue-600 font-semibold block">
                        {settings.phone || '+91 98765 43210'}
                      </a>
                      {settings.altPhone && (
                        <a href={`tel:${settings.altPhone}`} className="text-slate-600 hover:text-blue-600 font-semibold block">
                          {settings.altPhone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiMail className="text-emerald-600 text-xl mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900">Email Address</h4>
                      <a href={`mailto:${settings.email || 'info@ssglobalpublicschool.edu.in'}`} className="text-slate-600 hover:text-blue-600 font-semibold break-all block">
                        {settings.email || 'info@ssglobalpublicschool.edu.in'}
                      </a>
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

            {/* Contact Inquiry Form */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold font-serif text-slate-900 mb-2">
                Send Us a Direct Inquiry
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Fill out the form below and our administrative team will respond promptly.
              </p>

              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-600 text-xl shrink-0" />
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                      Mobile Number *
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
                      Inquiry Subject *
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Bihar"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Aurangabad"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      City / Village
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Daudnagar"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    PIN Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="e.g. 824143"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
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

          {/* Location & Directions Section */}
          <LocationSection />
        </div>
      </section>
    </main>
  );
};

export default Contact;
