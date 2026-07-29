import API from './api';

/**
 * Fetch public leadership members for Homepage (active & sorted by displayOrder ASC).
 * Endpoint: GET /api/leadership
 */
export const getPublicLeadershipApi = async () => {
  const response = await API.get('/leadership');
  return response.data;
};

/**
 * Fetch all leadership members for Admin Dashboard.
 * Endpoint: GET /api/admin/leadership
 */
export const getAdminLeadershipApi = async () => {
  const response = await API.get('/admin/leadership');
  return response.data;
};

/**
 * Create a new leadership profile (Admin).
 * Endpoint: POST /api/admin/leadership
 */
export const createLeadershipApi = async (formData) => {
  const isFormData = formData instanceof FormData;
  const response = await API.post('/admin/leadership', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

/**
 * Update an existing leadership profile (Admin).
 * Endpoint: PUT /api/admin/leadership/:id
 */
export const updateLeadershipApi = async (id, formData) => {
  const isFormData = formData instanceof FormData;
  const response = await API.put(`/admin/leadership/${id}`, formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

/**
 * Delete a leadership profile (Admin).
 * Endpoint: DELETE /api/admin/leadership/:id
 */
export const deleteLeadershipApi = async (id) => {
  const response = await API.delete(`/admin/leadership/${id}`);
  return response.data;
};
