import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import { FiMonitor, FiCpu, FiGlobe, FiBook, FiActivity, FiShield } from 'react-icons/fi';

const Facilities = () => {
  const facilityList = [
    {
      title: 'Smart Classroom',
      icon: <FiMonitor className="text-3xl text-blue-600" />,
      image: '/classRoom.webp',
      features: [
        'Interactive Touchboards & HD Projectors',
        'Digital Multimedia Curriculum Content',
        'Air-conditioned & Well-ventilated Seating',
        'Audio-Visual Learning Enhancements',
      ],
      description: 'Every classroom is equipped with smart interactive boards and digital modules to turn abstract concepts into vivid 3D learning experiences.',
    },
    {
      title: 'Academic Classroom & IT Lab',
      icon: <FiCpu className="text-3xl text-amber-500" />,
      image: '/classes.webp',
      features: [
        'Interactive Classroom Learning Environment',
        'Basic & Advanced Computer & Coding Curriculum',
        'Supervised High-Speed Internet Access',
        'Cyber Safety & Software Education',
      ],
      description: 'Our academic classrooms empower students with digital literacy, collaborative learning, and computer programming skills from early grades.',
    },
    {
      title: 'Playground & Sports Arena',
      icon: <FiActivity className="text-3xl text-rose-500" />,
      image: '/sports.webp',
      features: [
        'Spacious Cricket & Football Ground',
        'Volleyball & Badminton Courts',
        'Track Events & Athletics Coaching',
        'Annual Sports Competitions & Physical Fitness',
      ],
      description: 'Dedicated sports facilities encouraging physical fitness, teamwork, sportsmanship, and inter-school athletic participation.',
    },
    {
      title: 'Modern Campus Building',
      icon: <FiGlobe className="text-3xl text-purple-600" />,
      image: '/school.webp',
      features: [
        'State-of-the-art CBSE Architecture',
        'Physics, Chemistry & Biology Workstations',
        'Spacious Courtyard & Green Landscaping',
        'Clean & Hygienic Sanitation Facilities',
      ],
      description: 'A benchmark school campus situated in Daudnagar, Bihar, providing clean, inspiring learning spaces for every student.',
    },
    {
      title: 'Leadership & Administrative Wing',
      icon: <FiBook className="text-3xl text-emerald-600" />,
      image: '/principle.webp',
      features: [
        'Principal Manish Singh Guidance Office',
        'Parent Counseling & Helpdesk Desk',
        'Quiet Reading & Reference Room',
        'Digital School Records & Admissions Desk',
      ],
      description: 'Accessible administrative office led by Principal Manish Singh to assist parents with admissions, academic guidance, and queries.',
    },
    {
      title: 'CCTV Security & Transport Fleet',
      icon: <FiShield className="text-3xl text-sky-600" />,
      image: '/logo.webp',
      features: [
        '24/7 CCTV Camera Coverage across Campus',
        'Guarded Entry/Exit Points with Visitor Pass',
        'Safe Transport Bus Fleet across Daudnagar',
        'Female Staff Attendants in Junior Wing',
      ],
      description: 'The safety and well-being of our students is paramount. The campus and transport fleet are monitored continuously.',
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
              <div className="lg:col-span-5 h-64 sm:h-80 rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                <img
                  src={fac.image}
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
