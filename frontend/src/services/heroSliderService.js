import API from './api';

/**
 * Fetch public active hero slides from MongoDB.
 * Endpoint: GET /api/hero-slider
 */
export const getPublicHeroSlidesApi = async () => {
  const response = await API.get('/hero-slider');
  return response.data;
};

/**
 * Fetch all hero slides for Admin Panel.
 * Endpoint: GET /api/admin/hero-slider
 */
export const getAdminHeroSlidesApi = async () => {
  const response = await API.get('/admin/hero-slider');
  return response.data;
};

/**
 * Create a new hero slide (Admin).
 * Endpoint: POST /api/admin/hero-slider
 */
export const createHeroSlideApi = async (formData) => {
  const isFormData = formData instanceof FormData;
  const response = await API.post('/admin/hero-slider', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

/**
 * Update an existing hero slide (Admin).
 * Endpoint: PUT /api/admin/hero-slider/:id
 */
export const updateHeroSlideApi = async (id, formData) => {
  const isFormData = formData instanceof FormData;
  const response = await API.put(`/admin/hero-slider/${id}`, formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

/**
 * Delete a hero slide (Admin).
 * Endpoint: DELETE /api/admin/hero-slider/:id
 */
export const deleteHeroSlideApi = async (id) => {
  const response = await API.delete(`/admin/hero-slider/${id}`);
  return response.data;
};

/**
 * Reorder display order of hero slides (Admin).
 * Endpoint: PATCH /api/admin/hero-slider/reorder
 */
export const reorderHeroSlidesApi = async (orderList) => {
  const response = await API.patch('/admin/hero-slider/reorder', { orderList });
  return response.data;
};
