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
  FiCheck,
} from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import { getPublicFacilitiesApi } from '../../services/facilityService';
import { FACILITIES_FALLBACK } from '../../config/fallbackData';

const renderIcon = (iconName) => {
  switch (iconName) {
    case 'FiMonitor':
      return <FiMonitor className="text-xl text-[#34483B]" />;
    case 'FiZap':
      return <FiZap className="text-xl text-[#AD8746]" />;
    case 'FiCpu':
      return <FiCpu className="text-xl text-[#34483B]" />;
    case 'FiBookOpen':
      return <FiBookOpen className="text-xl text-[#34483B]" />;
    case 'FiActivity':
      return <FiActivity className="text-xl text-[#AD8746]" />;
    case 'FiShield':
      return <FiShield className="text-xl text-[#34483B]" />;
    default:
      return <FiCheckCircle className="text-xl text-[#34483B]" />;
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
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ssglobalpublicschool.com/' },
      { '@type': 'ListItem', position: 2, name: 'Facilities', item: 'https://www.ssglobalpublicschool.com/facilities' },
    ],
  };

  return (
    <main className="bg-[#F4EFE3] text-[#252821]">
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

      <section className="py-16 bg-[#F4EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#55594E] text-sm font-medium">Loading campus facilities...</p>
            </div>
          ) : facilityList.length > 0 ? (
            facilityList.map((fac, idx) => (
              <article
                key={fac._id || idx}
                className="bg-[#EBE2CC]/55 rounded-sm overflow-hidden border border-[#CFC5B1] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8"
              >
                <div className={`lg:col-span-5 h-64 sm:h-72 rounded-sm overflow-hidden border border-[#CFC5B1] bg-[#DED5C1] ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img
                    src={getImageUrl(fac.image)}
                    alt={fac.title}
                    width="500"
                    height="320"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>

                <div className={`lg:col-span-7 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#F4EFE3] rounded-sm border border-[#CFC5B1]">
                      {renderIcon(fac.icon)}
                    </div>
                    <h2 className="text-2xl font-bold font-serif text-[#34483B]">{fac.title}</h2>
                  </div>
                  <p className="text-[#55594E] text-sm sm:text-base leading-relaxed">
                    {fac.detailedDescription || fac.shortDescription}
                  </p>

                  <div className="pt-3 border-t border-[#CFC5B1] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#252821]">
                      <FiCheck className="text-[#34483B] shrink-0" />
                      <span>CBSE Standard Approved Infrastructure</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#252821]">
                      <FiCheck className="text-[#34483B] shrink-0" />
                      <span>Dedicated Faculty &amp; Supervision</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#252821]">
                      <FiCheck className="text-[#34483B] shrink-0" />
                      <span>Safe &amp; Hygienic Environment</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#252821]">
                      <FiCheck className="text-[#34483B] shrink-0" />
                      <span>Regular Maintenance &amp; Upgrades</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="bg-[#EBE2CC] p-12 rounded-sm text-center border border-[#CFC5B1] max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold font-serif text-[#34483B]">No Facilities Available</h3>
              <p className="text-xs text-[#55594E]">Facilities will appear here once added from the admin dashboard.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Facilities;
