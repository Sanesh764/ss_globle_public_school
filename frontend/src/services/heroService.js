import API from './api';

/**
 * Fetch dynamic front page hero banner slides from the backend.
 * Endpoint: GET /api/hero
 */
export const getHeroSlidesApi = async () => {
  const response = await API.get('/hero');
  return response.data;
};
