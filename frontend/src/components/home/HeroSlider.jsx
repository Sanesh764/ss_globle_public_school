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
      className="relative min-h-[600px] sm:min-h-[650px] lg:min-h-[720px] h-[88vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white select-none border-b border-slate-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images Layer with Slow Ken Burns (Zoom-In) & Smooth Fade */}
      {slides.map((s, idx) => {
        const isActive = idx === currentIndex;
        const slideId = s._id || idx;
        const rawUrl = getImageUrl(s.backgroundImage);
        const isHero4 = s.backgroundImage?.includes('hero-4') || s._id === 'hero-community-first';
        const bgUrl = (failedImages[slideId] && !isHero4) ? '/school.webp' : (isHero4 ? '/hero-4.jpg' : rawUrl);

        return (
          <React.Fragment key={slideId}>
            <div
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[1000ms] ease-in-out ${
                isActive
                  ? 'opacity-100 scale-105 transition-transform duration-[8000ms] ease-out z-0'
                  : 'opacity-0 scale-100 -z-10'
              }`}
              style={{
                backgroundImage: `url('${bgUrl}')`,
              }}
            />
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
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-blue-950/60 z-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-10" />

      {/* Hero Active Content Layer */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-3xl space-y-6">
          {/* Badge Pill */}
          {slide.badge && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold backdrop-blur-xl shadow-lg shadow-amber-400/10 animate-in fade-in slide-in-from-bottom duration-500">
              <FiCheckCircle className="text-amber-400 text-base shrink-0" /> {slide.badge}
            </div>
          )}

          {/* Title & Gradient Highlight */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif leading-[1.15] text-white tracking-tight animate-in fade-in slide-in-from-bottom duration-700">
            {slide.title || 'Welcome to'} <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              {slide.highlightTitle || 'S.S. Global Public School'}
            </span>
          </h1>

          {/* Subtitle / Subheading */}
          {slide.subtitle && (
            <p className="text-sm sm:text-base font-bold text-amber-300 tracking-wide font-serif uppercase animate-in fade-in duration-700">
              {slide.subtitle}
            </p>
          )}

          {/* Description */}
          {slide.description && (
            <p className="text-base sm:text-lg lg:text-xl text-slate-200 font-light leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom duration-1000">
              {slide.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-4 items-center">
            {slide.primaryButtonText && (
              <Link
                to={slide.primaryButtonLink || '/contact'}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 group"
              >
                <span>{slide.primaryButtonText}</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {slide.secondaryButtonText && (
              <Link
                to={slide.secondaryButtonLink || '/about'}
                className="px-8 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-base backdrop-blur-xl border border-white/15 hover:border-blue-400/50 shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {slide.secondaryButtonText}
              </Link>
            )}
          </div>

          {/* Premium Glass Feature Cards */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 border-t border-white/10">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 shadow-lg hover:border-blue-400/40 transition-colors card-hover">
              <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                <FiAward className="text-xl" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-serif">100% CBSE Curriculum</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Top Academic Standard</p>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 shadow-lg hover:border-blue-400/40 transition-colors card-hover">
              <div className="p-2 rounded-xl bg-blue-400/10 border border-blue-400/30 text-blue-400">
                <FiBookOpen className="text-xl" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-serif">Smart Tech Classrooms</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Interactive Learning</p>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 shadow-lg hover:border-blue-400/40 transition-colors card-hover">
              <div className="p-2 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400">
                <FiUsers className="text-xl" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-serif">Experienced Faculty</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Personalized Care</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphism Navigation Arrow Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-900/60 hover:bg-blue-600 text-white border border-white/15 flex items-center justify-center backdrop-blur-xl shadow-xl shadow-blue-950/50 transition-all duration-300 hover:scale-110 hover:border-blue-400"
          >
            <FiChevronLeft className="text-2xl" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-900/60 hover:bg-blue-600 text-white border border-white/15 flex items-center justify-center backdrop-blur-xl shadow-xl shadow-blue-950/50 transition-all duration-300 hover:scale-110 hover:border-blue-400"
          >
            <FiChevronRight className="text-2xl" />
          </button>

          {/* Animated Progress Indicators */}
          <div className="absolute bottom-6 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === currentIndex
                    ? 'w-10 bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-400/40'
                    : 'w-3 bg-white/30 hover:bg-white/60'
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
