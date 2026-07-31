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
  } = useHeroSlider(3000);

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
      className="relative min-h-[600px] sm:min-h-[650px] lg:min-h-[700px] h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images Layer with 700ms Smooth Fade Transition */}
      {slides.map((s, idx) => {
        const isActive = idx === currentIndex;
        const slideId = s._id || idx;
        const rawUrl = getImageUrl(s.backgroundImage);
        const bgUrl = failedImages[slideId] ? '/school.webp' : rawUrl;

        return (
          <React.Fragment key={slideId}>
            <div
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
              style={{
                backgroundImage: `url('${bgUrl}')`,
              }}
            />
            {/* Hidden img tag to catch 404 / network load failures */}
            <img
              src={rawUrl}
              alt=""
              className="hidden"
              onError={() => handleImageError(slideId)}
            />
          </React.Fragment>
        );
      })}

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 hero-gradient z-10 pointer-events-none"></div>

      {/* Hero Active Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-3xl space-y-6">
          {/* Badge */}
          {slide.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold backdrop-blur-md animate-fadeIn">
              <FiCheckCircle className="text-amber-400 text-base shrink-0" /> {slide.badge}
            </div>
          )}

          {/* Title & Highlight Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif leading-tight text-white tracking-tight">
            {slide.title || 'Welcome to'} <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              {slide.highlightTitle || 'S.S. Global Public School'}
            </span>
          </h1>

          {/* Description */}
          {slide.description && (
            <p className="text-lg sm:text-xl text-slate-200 font-light leading-relaxed">
              {slide.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap gap-4 items-center">
            {slide.primaryButtonText && (
              <Link
                to={slide.primaryButtonLink || '/contact'}
                className="px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-1 flex items-center gap-2 group"
              >
                {slide.primaryButtonText}{' '}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {slide.secondaryButtonText && (
              <Link
                to={slide.secondaryButtonLink || '/about'}
                className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base backdrop-blur-md border border-white/20 transition-all hover:border-white/40"
              >
                {slide.secondaryButtonText}
              </Link>
            )}
          </div>

          {/* Key Feature Bullets */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <FiAward className="text-amber-400 text-lg shrink-0" /> 100% CBSE Curriculum
            </div>
            <div className="flex items-center gap-2">
              <FiBookOpen className="text-blue-400 text-lg shrink-0" /> Smart Classrooms
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="text-emerald-400 text-lg shrink-0" /> Experienced Faculty
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all hover:scale-110"
          >
            <FiChevronLeft className="text-2xl" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all hover:scale-110"
          >
            <FiChevronRight className="text-2xl" />
          </button>

          <div className="absolute bottom-6 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-8 bg-amber-400 shadow-md shadow-amber-400/50' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Decorative Bottom Wave */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-slate-50 [clip-path:polygon(0_100%,100%_100%,100%_0)] z-20 pointer-events-none"></div>
    </div>
  );
};

export default HeroSlider;
