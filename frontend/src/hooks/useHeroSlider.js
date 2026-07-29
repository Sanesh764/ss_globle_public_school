import { useState, useEffect, useRef, useCallback } from 'react';
import { getPublicHeroSlidesApi } from '../services/heroSliderService';

export const useHeroSlider = (intervalMs = 3000) => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);

  const fallbackSlides = [
    {
      _id: 'fallback-1',
      backgroundImage: '/school.webp',
      badge: 'Admissions Open for Academic Session 2026-2027',
      title: 'Welcome to',
      highlightTitle: 'S.S. Global Public School',
      description: 'Located in Daudnagar, Bihar. We provide premier CBSE curriculum education, smart classrooms, state-of-the-art computer & science laboratories, and comprehensive character building under Principal Manish Singh.',
      primaryButtonText: 'Apply For Admission',
      primaryButtonLink: '/contact',
      secondaryButtonText: 'Explore School Vision',
      secondaryButtonLink: '/about',
      autoPlay: true,
    },
    {
      _id: 'fallback-2',
      backgroundImage: '/classRoom.webp',
      badge: 'State-of-the-Art Facilities',
      title: 'Interactive',
      highlightTitle: 'Modern Smart Classrooms',
      description: 'Interactive smart touchboards and digital learning modules designed for immersive 3D conceptual understanding.',
      primaryButtonText: 'Explore Facilities',
      primaryButtonLink: '/facilities',
      secondaryButtonText: 'View Campus',
      secondaryButtonLink: '/gallery',
      autoPlay: true,
    },
    {
      _id: 'fallback-3',
      backgroundImage: '/sports.webp',
      badge: 'Holistic Personality Development',
      title: 'Excellence In',
      highlightTitle: 'Sports & Athletic Arena',
      description: 'Spacious athletic ground supporting cricket, football, track events, and teamwork encouraging physical fitness and discipline.',
      primaryButtonText: 'Join Sports Arena',
      primaryButtonLink: '/contact',
      secondaryButtonText: 'Explore Gallery',
      secondaryButtonLink: '/gallery',
      autoPlay: true,
    },
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchSlides = async () => {
      try {
        setLoading(true);
        const res = await getPublicHeroSlidesApi();
        if (isMounted && res.success && Array.isArray(res.slides) && res.slides.length > 0) {
          setSlides(res.slides);
          if (import.meta.env.DEV) {
            console.log('[HeroSlider] Loaded slide image URLs:', res.slides.map((s) => s.backgroundImage));
          }
        } else if (isMounted) {
          setSlides(fallbackSlides);
        }
      } catch (err) {
        console.error('[useHeroSlider Hook] Error fetching slides:', err);
        if (isMounted) {
          setSlides(fallbackSlides);
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

  const currentSlide = slides[currentIndex] || fallbackSlides[0];

  // Auto-play interval timer with pause check
  useEffect(() => {
    if (slides.length <= 1 || isPaused || currentSlide.autoPlay === false) return;

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
    slides: slides.length > 0 ? slides : fallbackSlides,
    currentSlide,
    currentIndex,
    loading,
    nextSlide,
    prevSlide,
    goToSlide,
    setIsPaused,
    handleTouchStart,
    handleTouchEnd,
  };
};
