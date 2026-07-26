import React from 'react';
import { FiStar } from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa';

const Testimonials = () => {
  const reviews = [
    {
      name: 'Rajesh Kumar Singh',
      role: 'Parent (Class VIII)',
      text: 'S.S. Global Public School has transformed my son’s learning confidence. The smart classrooms and dedicated teachers in Daudnagar are commendable.',
      rating: 5,
    },
    {
      name: 'Sunita Devi',
      role: 'Parent (Class V)',
      text: 'The security standards, CCTV monitoring, and safe transport facility give us complete peace of mind. Truly a premier school in our region.',
      rating: 5,
    },
    {
      name: 'Aman Raj',
      role: 'Alumni (Batch 2025)',
      text: 'The science laboratory experiments and computer coding sessions prepared me for competitive entrance examinations. Proud to be an SS Global student!',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Parent & Student Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 mt-3">
            What Our Community Says
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col justify-between card-hover relative"
            >
              <FaQuoteLeft className="text-4xl text-blue-100 absolute top-6 right-6" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center space-x-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <FiStar key={i} className="fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full primary-gradient text-white flex items-center justify-center font-bold text-sm shadow">
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-serif">{rev.name}</h4>
                  <p className="text-xs text-blue-600 font-medium">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
