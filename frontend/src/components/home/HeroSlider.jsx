import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiAward, FiBookOpen, FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useHeroSlider } from '../../hooks/useHeroSlider';
import { getImageUrl } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const HeroSlider = () => {
  const {
    slides,
    currentSlide,
    currentIndex,
    loading,
    nextSlide,
    prevSlide,
    goToSlide,
    setIsPaused,
    handleTouchStart,
    handleTouchEnd,
  } = useHeroSlider(5000);

  const [failedImages, setFailedImages] = React.useState({});

  const handleImageError = (slideId) => {
    setFailedImages((prev) => ({ ...prev, [slideId]: true }));
  };

  if (loading) {
    return (
      <div className="relative min-h-[540px] flex items-center justify-center bg-[#EBE2CC] text-[#252821] border-b border-[#CFC5B1]">
        <LoadingSpinner text="Loading Campus Showcase..." />
      </div>
    );
  }

  const slide = currentSlide || {};

  return (
    <section
      className="relative bg-[#EBE2CC] text-[#252821] border-b border-[#CFC5B1] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Editorial Text Column */}
          <div className="lg:col-span-5 space-y-5 order-2 lg:order-1">
            {slide.badge && (
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E6D35]">
                <span className="w-6 h-[1.5px] bg-[#AD8746]" />
                <span>{slide.badge}</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold font-serif leading-[1.14] text-[#34483B] tracking-tight">
              {slide.title || 'Welcome to'}{' '}
              <span className="block text-[#252821] italic font-semibold mt-1">
                {slide.highlightTitle || 'S.S. Global Public School'}
              </span>
            </h1>

            {slide.subtitle && (
              <p className="text-xs font-semibold text-[#AD8746] tracking-[0.16em] uppercase">
                {slide.subtitle}
              </p>
            )}

            {slide.description && (
              <p className="text-sm sm:text-base text-[#55594E] leading-relaxed max-w-xl">
                {slide.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {slide.primaryButtonText && (
                <Link
                  to={slide.primaryButtonLink || '/contact'}
                  className="px-6 py-3 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 group"
                >
                  <span>{slide.primaryButtonText}</span>
                  <FiArrowRight className="text-[#AD8746] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {slide.secondaryButtonText && (
                <Link
                  to={slide.secondaryButtonLink || '/about'}
                  className="px-6 py-3 rounded-sm bg-[#F4EFE3] hover:bg-[#DED5C1] text-[#34483B] font-semibold text-sm tracking-wide border border-[#34483B]/40 transition-colors flex items-center justify-center"
                >
                  {slide.secondaryButtonText}
                </Link>
              )}
            </div>

            {/* Institutional Pillars Bar */}
            <div className="pt-5 mt-3 grid grid-cols-3 gap-4 border-t border-[#CFC5B1]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#34483B]">
                  <FiAward className="text-[#AD8746] text-sm shrink-0" />
                  <span className="text-xs font-bold font-serif">CBSE</span>
                </div>
                <p className="text-[11px] text-[#55594E] leading-snug">Academic Standard</p>
              </div>

              <div className="space-y-1 border-l border-[#CFC5B1] pl-3">
                <div className="flex items-center gap-1.5 text-[#34483B]">
                  <FiBookOpen className="text-[#AD8746] text-sm shrink-0" />
                  <span className="text-xs font-bold font-serif">Smart Labs</span>
                </div>
                <p className="text-[11px] text-[#55594E] leading-snug">Interactive Learning</p>
              </div>

              <div className="space-y-1 border-l border-[#CFC5B1] pl-3">
                <div className="flex items-center gap-1.5 text-[#34483B]">
                  <FiUsers className="text-[#AD8746] text-sm shrink-0" />
                  <span className="text-xs font-bold font-serif">Faculty</span>
                </div>
                <p className="text-[11px] text-[#55594E] leading-snug">Dedicated Mentors</p>
              </div>
            </div>
          </div>

          {/* Framed School Photograph Slideshow Column */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative w-full h-[300px] sm:h-[420px] lg:h-[520px] rounded-sm overflow-hidden border border-[#CFC5B1] bg-[#DED5C1] shadow-sm">
              {slides.map((s, idx) => {
                const isActive = idx === currentIndex;
                const slideId = s._id || idx;
                const rawUrl = getImageUrl(s.backgroundImage);
                const isHero4 =
                  s.backgroundImage?.includes('hero-4') ||
                  s._id === 'hero-community-first' ||
                  s.isIndependenceDay;
                const bgUrl =
                  failedImages[slideId] && !isHero4
                    ? '/school.webp'
                    : isHero4
                      ? '/hero-4.jpg'
                      : rawUrl;

                const objectPosClass = isHero4
                  ? 'bg-[center_top_15%] sm:bg-center'
                  : idx === 1
                    ? 'bg-top sm:bg-center'
                    : idx === 2
                      ? 'bg-[center_top_20%] sm:bg-center'
                      : 'bg-top sm:bg-center';

                return (
                  <React.Fragment key={slideId}>
                    {isHero4 ? (
                      <img
                        src="/hero-4.jpg"
                        alt="S.S. Global Public School Students & Faculty"
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                        className={`absolute inset-0 w-full h-full object-cover object-[center_top_15%] sm:object-center transition-opacity duration-700 ease-in-out ${
                          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-cover bg-no-repeat ${objectPosClass} transition-opacity duration-700 ease-in-out ${
                          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                        style={{
                          backgroundImage: `url('${bgUrl}')`,
                        }}
                      />
                    )}
                    {!isHero4 && (
                      <img
                        src={rawUrl}
                        alt=""
                        className="hidden"
                        onError={() => handleImageError(slideId)}
                      />
                    )}
                  </React.Fragment>
                );
              })}

              {/* Subtle bottom gradient solely to anchor controls cleanly */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#252821]/45 to-transparent z-20 pointer-events-none" />

              {/* Slideshow Controls */}
              {slides.length > 1 && (
                <div className="absolute bottom-4 inset-x-4 z-30 flex items-center justify-between">
                  {/* Slide Indicators */}
                  <div className="flex items-center gap-1.5">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-1.5 rounded-sm transition-all duration-300 ${
                          i === currentIndex
                            ? 'w-7 bg-[#AD8746]'
                            : 'w-2.5 bg-[#F4EFE3]/70 hover:bg-[#F4EFE3]'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Prev / Next Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={prevSlide}
                      aria-label="Previous Slide"
                      className="w-9 h-9 rounded-sm bg-[#F4EFE3]/95 hover:bg-[#34483B] text-[#34483B] hover:text-[#F4EFE3] border border-[#CFC5B1] flex items-center justify-center transition-colors"
                    >
                      <FiChevronLeft className="text-lg" />
                    </button>
                    <button
                      onClick={nextSlide}
                      aria-label="Next Slide"
                      className="w-9 h-9 rounded-sm bg-[#F4EFE3]/95 hover:bg-[#34483B] text-[#34483B] hover:text-[#F4EFE3] border border-[#CFC5B1] flex items-center justify-center transition-colors"
                    >
                      <FiChevronRight className="text-lg" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
