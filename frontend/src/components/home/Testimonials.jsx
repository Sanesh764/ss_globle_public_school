import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: 'Rajesh Kumar Singh',
    role: 'Parent',
    batch: 'Class VIII Parent',
    quote: 'S.S. Global Public School has transformed my son’s learning confidence. The smart classrooms and dedicated teachers in Daudnagar are truly commendable.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sunita Devi',
    role: 'Parent',
    batch: 'Class V Parent',
    quote: 'The security standards, CCTV monitoring, and safe transport facility give us complete peace of mind. Truly a premier school in our region.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Aman Raj',
    role: 'Alumni',
    batch: 'Batch of 2025',
    quote: 'The science laboratory experiments and computer coding sessions prepared me for competitive entrance examinations. Proud to be an SS Global student!',
    rating: 5,
  },
  {
    id: 4,
    name: 'Dr. Alok Prasad',
    role: 'Parent',
    batch: 'Class X Parent',
    quote: 'The academic rigor combined with emphasis on moral values has helped my daughter excel in CBSE board preparation. Outstanding leadership!',
    rating: 5,
  },
  {
    id: 5,
    name: 'Priya Sharma',
    role: 'Student',
    batch: 'Class XII Student',
    quote: 'The supportive faculty and digital smart boards make complex physics and mathematics concepts easy to understand. Best learning environment.',
    rating: 5,
  },
  {
    id: 6,
    name: 'Vikramaditya Singh',
    role: 'Guardian',
    batch: 'Class VII Guardian',
    quote: 'Spacious playground, inter-house sports competitions, and yoga sessions give our children complete physical and mental development.',
    rating: 5,
  },
  {
    id: 7,
    name: 'Meena Verma',
    role: 'Parent',
    batch: 'Class III Parent',
    quote: 'The primary wing teachers give individual care and affection to young learners. My daughter loves coming to school every day.',
    rating: 5,
  },
  {
    id: 8,
    name: 'Harsh Vardhan',
    role: 'Alumni',
    batch: 'Batch of 2024',
    quote: 'The public speaking events, debates, and robotics workshops built my confidence for university admissions and career success.',
    rating: 5,
  },
  {
    id: 9,
    name: 'Manoj Pandey',
    role: 'Parent',
    batch: 'Class IX Parent',
    quote: 'Regular parent-teacher meetings and transparent updates on student academic progress make S.S. Global the most trusted institution in Daudnagar.',
    rating: 5,
  },
  {
    id: 10,
    name: 'Ananya Kumari',
    role: 'Student',
    batch: 'Class X Student',
    quote: 'Our school library resources, computer labs, and interactive smart boards inspire us to explore beyond textbooks every single day.',
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, TESTIMONIALS_DATA.length - itemsPerPage);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  const nextSlide = () => setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    if (diffX > 50) nextSlide();
    else if (diffX < -50) prevSlide();
    setIsPaused(false);
  };

  return (
    <section className="py-16 sm:py-20 bg-[#F4EFE3] text-[#252821] border-b border-[#CFC5B1] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-5 border-b border-[#CFC5B1]">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>Community Voices</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B] tracking-tight">
              What Our Community Says
            </h2>
            <p className="text-[#55594E] text-sm sm:text-base max-w-2xl leading-relaxed">
              Hear directly from parents, students, alumni, and guardians about their experiences at S.S. Global Public School, Daudnagar.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={prevSlide}
              aria-label="Previous Testimonials"
              className="w-10 h-10 rounded-sm bg-[#EBE2CC] hover:bg-[#34483B] text-[#34483B] hover:text-[#F4EFE3] border border-[#CFC5B1] flex items-center justify-center transition-colors"
            >
              <FiChevronLeft className="text-lg" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Testimonials"
              className="w-10 h-10 rounded-sm bg-[#EBE2CC] hover:bg-[#34483B] text-[#34483B] hover:text-[#F4EFE3] border border-[#CFC5B1] flex items-center justify-center transition-colors"
            >
              <FiChevronRight className="text-lg" />
            </button>
          </div>
        </div>

        <div
          className="overflow-hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translate3d(-${currentIndex * (100 / itemsPerPage)}%, 0, 0)`,
            }}
          >
            {TESTIMONIALS_DATA.map((item) => (
              <div
                key={item.id}
                className="px-3 shrink-0"
                style={{ width: `${100 / itemsPerPage}%` }}
              >
                <div className="bg-[#EBE2CC]/60 rounded-sm p-6 sm:p-7 border border-[#CFC5B1] hover:border-[#AD8746] flex flex-col justify-between h-full transition-colors relative">
                  <FaQuoteLeft className="text-2xl text-[#CFC5B1] absolute top-6 right-6" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center space-x-1 text-[#AD8746]">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <FaStar key={i} className="text-xs fill-current" />
                      ))}
                    </div>

                    <p className="text-[#252821] text-sm leading-relaxed italic">
                      “{item.quote}”
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#CFC5B1] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-[#34483B] text-[#F4EFE3] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                      {item.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[#34483B] font-serif truncate">{item.name}</h4>
                      <p className="text-xs text-[#AD8746] font-semibold truncate">
                        {item.role} • <span className="text-[#55594E] font-normal">{item.batch}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-center gap-2 pt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-sm transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-[#34483B]'
                  : 'w-2.5 bg-[#CFC5B1] hover:bg-[#AD8746]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
