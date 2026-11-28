import React, { useState, useContext } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SEO from '../../components/common/SEO';
import LocationSection from '../../components/common/LocationSection';
import { SettingContext } from '../../context/SettingContext';
import { useToast } from '../../hooks/useToast';
import { submitContactApi } from '../../services/contactService';
import { getSchoolSchema } from '../../utils/seoSchema';
import { PUBLIC_ROUTE_SEO } from '../../utils/seoRoutesConfig';
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
    name: 'Contact & Admissions - S.S. Global Public School Daudnagar',
    url: 'https://www.ssglobalpublicschool.com/contact',
    mainEntity: getSchoolSchema({ includeContext: false }),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSuccessMsg('');
      const res = await submitContactApi(formData);
      if (res.success) {
        const msg =
          res.message || 'Thank you! Your inquiry has been received. Our team will contact you soon.';
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

  const inputClass =
    'w-full px-3.5 py-2.5 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm text-sm text-[#252821] placeholder-[#55594E]/60 focus:outline-none focus:border-[#34483B] focus:ring-1 focus:ring-[#34483B] transition-colors';
  const labelClass = 'block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1.5';

  return (
    <main className="bg-[#F4EFE3] text-[#252821]">
      <SEO
        title={PUBLIC_ROUTE_SEO['/contact'].title}
        description={PUBLIC_ROUTE_SEO['/contact'].description}
        canonicalUrl={PUBLIC_ROUTE_SEO['/contact'].canonicalUrl}
        jsonLd={contactSchema}
      />
      <PageHeader
        title="Contact & Admission Inquiries"
        subtitle="Get in touch with S.S. Global Public School admin office or submit an online inquiry."
        breadcrumb={[{ label: 'Contact' }]}
      />

      <section className="py-14 bg-[#F4EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Contact Information Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#EBE2CC]/60 p-7 sm:p-8 rounded-sm border border-[#CFC5B1] space-y-6">
                <h2 className="text-2xl font-bold font-serif text-[#34483B] border-l-2 border-[#AD8746] pl-3">
                  School Administrative Office
                </h2>

                <div className="divide-y divide-[#CFC5B1] border-t border-b border-[#CFC5B1] text-sm">
                  <div className="py-3.5 flex items-start gap-3.5">
                    <FiMapPin className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">School Campus Address</h4>
                      <p className="text-[#252821] text-xs sm:text-sm mt-0.5 leading-relaxed">
                        {settings.address || 'Daudnagar, Bihar - 824143, India'}
                      </p>
                    </div>
                  </div>

                  <div className="py-3.5 flex items-start gap-3.5">
                    <FiPhone className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">Phone Numbers</h4>
                      <a
                        href={`tel:${settings.phone || '+919122490003'}`}
                        className="text-[#252821] hover:text-[#AD8746] font-medium block text-xs sm:text-sm mt-0.5"
                      >
                        {settings.phone || '+91 9122490003'}
                      </a>
                    </div>
                  </div>

                  <div className="py-3.5 flex items-start gap-3.5">
                    <FiMail className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">Email Address</h4>
                      <a
                        href={`mailto:${settings.email || 'ssglobalpublicschool0@gmail.com'}`}
                        className="text-[#252821] hover:text-[#AD8746] font-medium break-all block text-xs sm:text-sm mt-0.5"
                      >
                        {settings.email || 'ssglobalpublicschool0@gmail.com'}
                      </a>
                    </div>
                  </div>

                  <div className="py-3.5 flex items-start gap-3.5">
                    <FiClock className="text-[#34483B] text-lg mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-[#34483B] text-xs uppercase tracking-wider">Office Working Hours</h4>
                      <p className="text-[#252821] text-xs sm:text-sm mt-0.5">
                        {settings.officeHours || 'Monday - Saturday: 8:00 AM - 3:00 PM'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admission Note */}
              <div className="bg-[#34483B] text-[#F4EFE3] p-6 rounded-sm border border-[#27372D] space-y-2">
                <h4 className="font-bold font-serif text-lg flex items-center gap-2">
                  <FiCheckCircle className="text-[#AD8746] text-lg" /> Admissions Open 2026–2027
                </h4>
                <p className="text-xs sm:text-sm text-[#EBE2CC]/85 leading-relaxed">
                  Parents can visit the school office during working hours to obtain the prospectus and admission registration form.
                </p>
              </div>
            </div>

            {/* Contact Inquiry Form */}
            <div className="lg:col-span-7 bg-[#EBE2CC]/55 p-7 sm:p-10 rounded-sm border border-[#CFC5B1]">
              <h2 className="text-2xl font-bold font-serif text-[#34483B] mb-1.5">
                Send Us a Direct Inquiry
              </h2>
              <p className="text-[#55594E] text-sm mb-6">
                Fill out the form below and our administrative team will respond promptly.
              </p>

              {successMsg && (
                <div className="mb-6 p-4 bg-[#34483B]/10 border border-[#34483B]/40 rounded-sm text-[#34483B] text-sm font-medium flex items-center gap-2">
                  <FiCheckCircle className="text-[#34483B] text-lg shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9122490003"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Inquiry Subject *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={inputClass}
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
                    <label className={labelClass}>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Bihar"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>District</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Aurangabad"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>City / Village</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Daudnagar"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>PIN Code (Optional)</label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="e.g. 824143"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Your Message / Question *</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your message or questions regarding admission..."
                    className={inputClass}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm tracking-wide rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSend className="text-[#AD8746]" />
                  <span>{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            </div>
          </div>

          <LocationSection />
        </div>
      </section>
    </main>
  );
};

export default Contact;
