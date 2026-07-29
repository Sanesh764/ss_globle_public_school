import { getHeroSlidesService } from '../services/hero.service.js';

/**
 * GET /api/hero
 * Public controller to retrieve dynamic front page hero banner slides.
 */
export const getHeroSlides = (req, res, next) => {
  try {
    const slides = getHeroSlidesService(req);
    return res.status(200).json({
      success: true,
      count: slides.length,
      slides,
    });
  } catch (error) {
    next(error);
  }
};
