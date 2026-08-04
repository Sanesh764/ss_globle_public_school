import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import SEO from '../../components/common/SEO';
import { getImageUrl } from '../../services/api';
import {
  FiMonitor,
  FiZap,
  FiCpu,
  FiBookOpen,
  FiActivity,
  FiShield,
  FiCheckCircle,
} from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import { getPublicFacilitiesApi } from '../../services/facilityService';
import { FACILITIES_FALLBACK } from '../../config/fallbackData';

const renderIcon = (iconName) => {
  switch (iconName) {
    case 'FiMonitor':
      return <FiMonitor className="text-3xl text-blue-600" />;
    case 'FiZap':
      return <FiZap className="text-3xl text-amber-500" />;
    case 'FiCpu':
      return <FiCpu className="text-3xl text-purple-600" />;
    case 'FiBookOpen':
      return <FiBookOpen className="text-3xl text-indigo-600" />;
    case 'FiActivity':
      return <FiActivity className="text-3xl text-rose-500" />;
    case 'FiShield':
      return <FiShield className="text-3xl text-sky-600" />;
    default:
      return <FiCheckCircle className="text-3xl text-blue-600" />;
  }
};

const Facilities = () => {
  const { data, loading, error } = useFetch(getPublicFacilitiesApi);

  let facilityList = [];
  if (error) {
    facilityList = FACILITIES_FALLBACK;
  } else if (data) {
    const fetchedList = data?.data?.facilities || data?.facilities || (Array.isArray(data?.data) ? data.data : []);
    facilityList = Array.isArray(fetchedList) ? fetchedList : FACILITIES_FALLBACK;
  }

  const facilitiesSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://www.ssglobalpublicschool.com/',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Facilities',
        'item': 'https://www.ssglobalpublicschool.com/facilities',
      },
    ],
  };

  return (
    <main>
      <SEO
        title="Campus Infrastructure & Facilities | S.S. Global Public School Daudnagar"
        description="Explore modern campus facilities at S.S. Global Public School, Daudnagar, Bihar: interactive smart classrooms, physics & chemistry labs, computer labs, sports & transport."
        keywords="S.S. Global Public School facilities, S.S. Global Public School Daudnagar, Daudnagar school infrastructure, smart classrooms Daudnagar, science lab Bihar, school transport Aurangabad"
        canonicalUrl="https://www.ssglobalpublicschool.com/facilities"
        jsonLd={facilitiesSchema}
      />
      <PageHeader
        title="Campus Infrastructure & Facilities"
        subtitle="World-class educational facilities engineered to nurture curiosity, safety, and physical well-being."
        breadcrumb={[{ label: 'Facilities' }]}
      />

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm font-medium">Loading campus facilities...</p>
            </div>
          ) : facilityList.length > 0 ? (
            facilityList.map((fac, idx) => (
              <div
                key={fac._id || idx}
                className={`bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 card-hover ${
                  idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="lg:col-span-5 h-64 sm:h-80 rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                  <img
                    src={getImageUrl(fac.image)}
                    alt={fac.title}
                    width="500"
                    height="320"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 rounded-2xl shadow-sm">{renderIcon(fac.icon)}</div>
                    <h3 className="text-2xl font-bold font-serif text-slate-900">{fac.title}</h3>
                  </div>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {fac.detailedDescription || fac.shortDescription}
                  </p>

                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      <span>CBSE Standard Approved Infrastructure</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      <span>Dedicated Faculty & Supervision</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      <span>Safe & Hygienic Environment</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      <span>Regular Maintenance & Upgrades</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold font-serif text-slate-800">No Facilities Available</h3>
              <p className="text-xs text-slate-500">Facilities will appear here once added from the admin dashboard.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Facilities;
