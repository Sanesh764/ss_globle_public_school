import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../services/api';
import {
  FiMonitor,
  FiZap,
  FiCpu,
  FiBookOpen,
  FiActivity,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import { getPublicFacilitiesApi } from '../../services/facilityService';
import { FACILITIES_FALLBACK } from '../../config/fallbackData';

const renderIcon = (iconName) => {
  switch (iconName) {
    case 'FiMonitor':
      return <FiMonitor className="text-lg text-[#34483B]" />;
    case 'FiZap':
      return <FiZap className="text-lg text-[#AD8746]" />;
    case 'FiCpu':
      return <FiCpu className="text-lg text-[#34483B]" />;
    case 'FiBookOpen':
      return <FiBookOpen className="text-lg text-[#34483B]" />;
    case 'FiActivity':
      return <FiActivity className="text-lg text-[#AD8746]" />;
    case 'FiShield':
      return <FiShield className="text-lg text-[#34483B]" />;
    default:
      return <FiCheckCircle className="text-lg text-[#34483B]" />;
  }
};

const FacilitiesPreview = () => {
  const { data, loading, error } = useFetch(getPublicFacilitiesApi);

  let displayList = [];
  if (error) {
    displayList = FACILITIES_FALLBACK.slice(0, 4);
  } else if (data) {
    const fetchedList = data?.data?.facilities || data?.facilities || (Array.isArray(data?.data) ? data.data : []);
    displayList = Array.isArray(fetchedList) ? fetchedList.slice(0, 4) : FACILITIES_FALLBACK.slice(0, 4);
  }

  if (!loading && !error && displayList.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-[#EBE2CC] text-[#252821] border-b border-[#CFC5B1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 pb-5 border-b border-[#CFC5B1]">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>Campus Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B] mt-2 tracking-tight">
              Modern Campus Facilities
            </h2>
          </div>
          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 text-[#34483B] hover:text-[#AD8746] font-semibold text-sm transition-colors"
          >
            <span>View All Facilities</span>
            <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#55594E] text-sm font-medium">Loading campus facilities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayList.map((fac, idx) => (
              <article
                key={fac._id || idx}
                className="group bg-[#F4EFE3] rounded-sm overflow-hidden border border-[#CFC5B1] hover:border-[#AD8746] transition-colors flex flex-col"
              >
                <div className="h-48 overflow-hidden relative bg-[#DED5C1] border-b border-[#CFC5B1]">
                  <img
                    src={getImageUrl(fac.image)}
                    alt={fac.title}
                    width="300"
                    height="192"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#F4EFE3]/95 p-2 rounded-sm border border-[#CFC5B1]">
                    {renderIcon(fac.icon)}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#34483B] font-serif mb-2 leading-snug">
                      {fac.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#55594E] leading-relaxed line-clamp-3">
                      {fac.shortDescription}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FacilitiesPreview;
