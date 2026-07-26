import React from 'react';
import { Link } from 'react-router-dom';
import { FiMonitor, FiCpu, FiGlobe, FiBook, FiActivity, FiShield, FiTruck, FiArrowRight } from 'react-icons/fi';

const FacilitiesPreview = () => {
  const facilities = [
    {
      title: 'Smart Classroom',
      icon: <FiMonitor className="text-2xl text-blue-600" />,
      desc: 'Interactive smart boards and digital learning modules for immersive conceptual understanding.',
      img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Computer & Coding Lab',
      icon: <FiCpu className="text-2xl text-amber-500" />,
      desc: 'High-speed internet desktop systems with modern coding and software applications.',
      img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Composite Science Lab',
      icon: <FiGlobe className="text-2xl text-purple-600" />,
      desc: 'Hands-on practical equipment for Physics, Chemistry, and Biology experiments.',
      img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Rich Library & Reading Room',
      icon: <FiBook className="text-2xl text-emerald-600" />,
      desc: 'Thousands of books, reference journals, encyclopedias, and quiet reading spaces.',
      img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600&auto=format&fit=crop',
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((fac, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col card-hover"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={fac.img}
                  alt={fac.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-md">
                  {fac.icon}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif mb-2 group-hover:text-blue-600 transition-colors">
                    {fac.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {fac.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesPreview;
