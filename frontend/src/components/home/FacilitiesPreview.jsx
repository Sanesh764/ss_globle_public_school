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
      return <FiMonitor className="text-2xl text-blue-600" />;
    case 'FiZap':
      return <FiZap className="text-2xl text-amber-500" />;
    case 'FiCpu':
      return <FiCpu className="text-2xl text-purple-600" />;
    case 'FiBookOpen':
      return <FiBookOpen className="text-2xl text-indigo-600" />;
    case 'FiActivity':
      return <FiActivity className="text-2xl text-rose-500" />;
    case 'FiShield':
      return <FiShield className="text-2xl text-emerald-600" />;
    default:
      return <FiCheckCircle className="text-2xl text-blue-600" />;
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              World Class Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 mt-3">
              Modern Campus Facilities
            </h2>
          </div>
          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm hover:underline"
          >
            View All Facilities <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm font-medium">Loading campus facilities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayList.map((fac, idx) => (
              <div
                key={fac._id || idx}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col card-hover"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={getImageUrl(fac.image)}
                    alt={fac.title}
                    width="300"
                    height="192"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-md">
                    {renderIcon(fac.icon)}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-serif mb-2 group-hover:text-blue-600 transition-colors">
                      {fac.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {fac.shortDescription}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FacilitiesPreview;
