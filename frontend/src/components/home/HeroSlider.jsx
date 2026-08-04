import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiAward, FiBookOpen, FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
      <div className="relative min-h-[600px] sm:min-h-[650px] lg:min-h-[700px] h-[85vh] flex items-center justify-center bg-slate-950 text-white">
        <LoadingSpinner />
      </div>
    );
  }

  const slide = currentSlide || {};

  return (
    <div
      className="relative min-h-[90vh] md:min-h-[650px] lg:min-h-[720px] md:h-[75vh] lg:h-[88vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white select-none border-b border-slate-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images Layer with Custom Mobile Framing, Ken Burns Zoom & Smooth Fade */}
      {slides.map((s, idx) => {
        const isActive = idx === currentIndex;
        const slideId = s._id || idx;
        const rawUrl = getImageUrl(s.backgroundImage);
        const isHero4 = s.backgroundImage?.includes('hero-4') || s._id === 'hero-community-first';
        const bgUrl = (failedImages[slideId] && !isHero4) ? '/school.webp' : (isHero4 ? '/hero-4.jpg' : rawUrl);

        // Custom mobile object position framing to ensure student/teacher faces are never cropped
        const objectPosClass = isHero4
          ? 'bg-[center_top_15%] sm:bg-center'
          : (idx === 1 ? 'bg-top sm:bg-center' : (idx === 2 ? 'bg-[center_top_20%] sm:bg-center' : 'bg-top sm:bg-center'));

        return (
          <React.Fragment key={slideId}>
            {isHero4 ? (
              <img
                src="/hero-4.jpg"
                alt="S.S. Global Public School Students & Faculty"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover object-[center_top_15%] sm:object-center transition-all duration-[1000ms] ease-in-out ${
                  isActive
                    ? 'opacity-100 scale-105 transition-transform duration-[8000ms] ease-out z-0'
                    : 'opacity-0 scale-100 -z-10'
                }`}
              />
            ) : (
              <div
                className={`absolute inset-0 bg-cover bg-no-repeat ${objectPosClass} transition-all duration-[1000ms] ease-in-out ${
                  isActive
                    ? 'opacity-100 scale-105 transition-transform duration-[8000ms] ease-out z-0'
                    : 'opacity-0 scale-100 -z-10'
                }`}
                style={{
                  backgroundImage: `url('${bgUrl}')`,
                }}
              />
            )}
            {/* Hidden img tag to catch 404 / network load failures */}
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

      {/* Multi-Layered Premium Dark Navy Gradient Overlays & Ambient Glow Blobs */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-blue-950/70 z-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-[35rem] sm:h-[35rem] bg-blue-600/15 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-[35rem] sm:h-[35rem] bg-amber-500/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none z-10" />

      {/* Hero Active Content Layer */}
      <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-20 w-full flex flex-col justify-center">
        <div className="max-w-3xl space-y-4 sm:space-y-6 pb-6 sm:pb-0">
          {/* Badge Pill */}
          {slide.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[13px] sm:text-sm font-bold backdrop-blur-xl shadow-lg shadow-amber-400/10 animate-in fade-in slide-in-from-bottom duration-500">
              <FiCheckCircle className="text-amber-400 text-sm sm:text-base shrink-0" /> {slide.badge}
            </div>
          )}

          {/* Title & Gradient Highlight */}
          <h1 className="text-[34px] sm:text-4xl md:text-[54px] lg:text-6xl font-extrabold font-serif leading-[1.12] sm:leading-[1.15] text-white tracking-tight animate-in fade-in slide-in-from-bottom duration-700">
            {slide.title || 'Welcome to'} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              {slide.highlightTitle || 'S.S. Global Public School'}
            </span>
          </h1>

          {/* Subtitle / Subheading */}
          {slide.subtitle && (
            <p className="text-xs sm:text-sm md:text-base font-bold text-amber-300 tracking-wide font-serif uppercase animate-in fade-in duration-700">
              {slide.subtitle}
            </p>
          )}

          {/* Description */}
          {slide.description && (
            <p className="text-sm sm:text-base lg:text-xl text-slate-200 font-light leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom duration-1000">
              {slide.description}
            </p>
          )}

          {/* Action Buttons (Stacked Vertically on Mobile max 320px, Row on Desktop) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 w-full">
            {slide.primaryButtonText && (
              <Link
                to={slide.primaryButtonLink || '/contact'}
                className="w-full sm:w-auto max-w-[320px] h-[50px] min-h-[44px] px-6 sm:px-8 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all duration-300 transform active:scale-[0.99] sm:hover:-translate-y-1 flex items-center justify-center gap-2 group"
              >
                <span>{slide.primaryButtonText}</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {slide.secondaryButtonText && (
              <Link
                to={slide.secondaryButtonLink || '/about'}
                className="w-full sm:w-auto max-w-[320px] h-[50px] min-h-[44px] px-6 sm:px-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm sm:text-base backdrop-blur-xl border border-white/15 hover:border-blue-400/50 shadow-xl transition-all duration-300 transform active:scale-[0.99] sm:hover:-translate-y-1 flex items-center justify-center"
              >
                {slide.secondaryButtonText}
              </Link>
            )}
          </div>

          {/* Premium Glass Feature Cards */}
          <div className="pt-4 sm:pt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 border-t border-white/10">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-3 shadow-lg hover:border-blue-400/40 transition-colors card-hover">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0">
                <FiAward className="text-lg sm:text-xl" />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold text-white font-serif">100% CBSE Curriculum</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Top Academic Standard</p>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-3 shadow-lg hover:border-blue-400/40 transition-colors card-hover">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-400/10 border border-blue-400/30 text-blue-400 shrink-0">
                <FiBookOpen className="text-lg sm:text-xl" />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold text-white font-serif">Smart Tech Classrooms</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Interactive Learning</p>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-3 shadow-lg hover:border-blue-400/40 transition-colors card-hover">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 shrink-0">
                <FiUsers className="text-lg sm:text-xl" />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold text-white font-serif">Experienced Faculty</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Personalized Care</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphism Navigation Arrow Controls (Non-overlapping, touch-friendly min 44px) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full bg-slate-950/40 hover:bg-blue-600 text-white/80 hover:text-white border border-white/15 flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <FiChevronLeft className="text-xl sm:text-2xl" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full bg-slate-950/40 hover:bg-blue-600 text-white/80 hover:text-white border border-white/15 flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <FiChevronRight className="text-xl sm:text-2xl" />
          </button>

          {/* Animated Progress Indicators */}
          <div className="absolute bottom-4 sm:bottom-6 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                  i === currentIndex
                    ? 'w-8 sm:w-10 bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-400/40'
                    : 'w-2.5 sm:w-3 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;
