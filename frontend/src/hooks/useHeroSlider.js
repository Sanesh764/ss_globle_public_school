import { useState, useEffect, useRef, useCallback } from 'react';
import { getPublicHeroSlidesApi } from '../services/heroSliderService';
import { HERO_SLIDES_FALLBACK, NEW_FIRST_HERO_SLIDE } from '../config/fallbackData';
import { isIndependenceDay2026 } from '../utils/formatDate';

export const INDEPENDENCE_DAY_HERO_SLIDE = {
  _id: 'hero-independence-day-2026',
  isIndependenceDay: true,
  backgroundImage: '/hero-4.jpg',
  badge: '🇮🇳 INDEPENDENCE DAY 2026',
  title: 'Celebrating Freedom,',
  highlightTitle: 'Inspiring Young Minds',
  subtitle: 'S.S. GLOBAL PUBLIC SCHOOL • 15 AUGUST 2026',
  description: 'S.S. Global Public School wishes everyone a very Happy Independence Day. May the spirit of freedom, unity and learning inspire every young mind.',
  primaryButtonText: 'Explore Our School',
  primaryButtonLink: '/about',
  secondaryButtonText: 'View Gallery',
  secondaryButtonLink: '/gallery',
  autoPlay: true,
};

export const useHeroSlider = (intervalMs = 5000) => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const fetchSlides = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await getPublicHeroSlidesApi();
        if (isMounted) {
          let baseSlides = [];
          if (res?.success && Array.isArray(res.slides) && res.slides.length > 0) {
            const apiSlides = res.slides.filter(
              (s) => s._id !== 'hero-community-first' && !s.backgroundImage?.includes('hero-4')
            );
            baseSlides = [NEW_FIRST_HERO_SLIDE, ...apiSlides];
          } else {
            setError(true);
            baseSlides = HERO_SLIDES_FALLBACK;
          }

          if (isIndependenceDay2026()) {
            setSlides([INDEPENDENCE_DAY_HERO_SLIDE, ...baseSlides]);
          } else {
            setSlides(baseSlides);
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[useHeroSlider Hook] API failure, using local hero fallback:', err.message);
        }
        if (isMounted) {
          setError(true);
          const baseSlides = HERO_SLIDES_FALLBACK;
          if (isIndependenceDay2026()) {
            setSlides([INDEPENDENCE_DAY_HERO_SLIDE, ...baseSlides]);
          } else {
            setSlides(baseSlides);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  // Preload next image in memory for zero-lag transitions
  useEffect(() => {
    if (slides.length > 1) {
      const nextIndex = (currentIndex + 1) % slides.length;
      if (slides[nextIndex] && slides[nextIndex].backgroundImage) {
        const img = new Image();
        img.src = slides[nextIndex].backgroundImage;
      }
    }
  }, [currentIndex, slides]);

  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) nextSlide(); // Swiped Left -> Next Slide
    if (diff < -50) prevSlide(); // Swiped Right -> Prev Slide
  };

  const currentSlide = slides[currentIndex] || HERO_SLIDES_FALLBACK[0];

  // Auto-play interval timer with pause check
  useEffect(() => {
    if (slides.length <= 1 || isPaused || !currentSlide || currentSlide.autoPlay === false) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [slides.length, isPaused, nextSlide, intervalMs, currentSlide]);

  return {
    slides: slides.length > 0 ? slides : HERO_SLIDES_FALLBACK,
    currentSlide,
    currentIndex,
    loading,
    error,
    nextSlide,
    prevSlide,
    goToSlide,
    setIsPaused,
    handleTouchStart,
    handleTouchEnd,
  };
};
