import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import { FiMonitor, FiCpu, FiGlobe, FiBook, FiActivity, FiShield, FiTruck } from 'react-icons/fi';

const Facilities = () => {
  const facilityList = [
    {
      title: 'Smart Classroom',
      icon: <FiMonitor className="text-3xl text-blue-600" />,
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop',
      features: [
        'Interactive Touchboards & HD Projectors',
        'Digital Multimedia Curriculum Content',
        'Air-conditioned & Well-ventilated Seating',
        'Audio-Visual Learning Enhancements',
      ],
      description: 'Every classroom is equipped with smart interactive boards and digital modules to turn abstract concepts into vivid 3D learning experiences.',
    },
    {
      title: 'Computer & IT Lab',
      icon: <FiCpu className="text-3xl text-amber-500" />,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      features: [
        'Latest High-Speed Desktop Computers',
        'Basic & Advanced Coding Curriculum',
        'Supervised High-Speed Internet Access',
        'Cyber Safety & Software Education',
      ],
      description: 'Our computer laboratory empowers students with digital literacy, computer programming skills, and software productivity from early grades.',
    },
    {
      title: 'Composite Science Laboratory',
      icon: <FiGlobe className="text-3xl text-purple-600" />,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
      features: [
        'Physics, Chemistry & Biology Workstations',
        'Modern Apparatus & Safety Equipment',
        'Hands-on Practical Experimentations',
        'Guided Demonstration by Expert Lab Faculty',
      ],
      description: 'Well-equipped laboratories designed according to CBSE guidelines, enabling students to explore scientific concepts through practical experimentation.',
    },
    {
      title: 'Comprehensive Library',
      icon: <FiBook className="text-3xl text-emerald-600" />,
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop',
      features: [
        'Extensive Collection of Books & Reference Volumes',
        'Academic Journals, Periodicals & Magazines',
        'Quiet Reading & Study Zones',
        'Digital E-book Portal Access',
      ],
      description: 'A quiet sanctuary stocked with classic literature, academic textbooks, encyclopedias, and storybooks to cultivate a lifelong reading habit.',
    },
    {
      title: 'Playground & Sports Arena',
      icon: <FiActivity className="text-3xl text-rose-500" />,
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
      features: [
        'Spacious Cricket & Football Ground',
        'Volleyball & Badminton Courts',
        'Indoor Games: Chess, Table Tennis, Carrom',
        'Annual Sports Competitions & Physical Fitness',
      ],
      description: 'Dedicated sports facilities encouraging physical fitness, teamwork, sportsmanship, and inter-school athletic participation.',
    },
    {
      title: 'CCTV Security & Safety',
      icon: <FiShield className="text-3xl text-sky-600" />,
      image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop',
      features: [
        '24/7 CCTV Camera Coverage across Campus',
        'Guarded Entry/Exit Points with Visitor Pass',
        'Fire Fighting Systems & First Aid Medical Room',
        'Female Staff Attendants in Junior Wing',
      ],
      description: 'The safety and well-being of our students is paramount. The campus is monitored continuously by security personnel and surveillance systems.',
    },
    {
      title: 'School Transport System',
      icon: <FiTruck className="text-3xl text-indigo-600" />,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
      features: [
        'Fleet of Safe School Buses & Vans',
        'Coverage across Daudnagar & Neighboring Regions',
        'Experienced Drivers & Helper Attendants',
        'Strict Adherence to Safety Standards',
      ],
      description: 'Punctual, safe, and comfortable transport facility covering major routes in Daudnagar and nearby villages.',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Campus Infrastructure & Facilities"
        subtitle="World-class educational facilities engineered to nurture curiosity, safety, and physical well-being."
        breadcrumb={[{ label: 'Facilities' }]}
      />

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {facilityList.map((fac, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 card-hover ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="lg:col-span-5 h-64 sm:h-80 rounded-2xl overflow-hidden shadow-inner">
                <img
                  src={fac.image}
                  alt={fac.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 rounded-2xl shadow-sm">{fac.icon}</div>
                  <h3 className="text-2xl font-bold font-serif text-slate-900">{fac.title}</h3>
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {fac.description}
                </p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {fac.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Facilities;
