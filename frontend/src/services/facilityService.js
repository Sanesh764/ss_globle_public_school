import api from './api';

export const getPublicFacilitiesApi = async () => {
  const response = await api.get('/facilities');
  return response.data;
};

export const getAdminFacilitiesApi = async () => {
  const response = await api.get('/admin/facilities');
  return response.data;
};

export const createFacilityApi = async (formData) => {
  const response = await api.post('/admin/facilities', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateFacilityApi = async (id, formData) => {
  const response = await api.put(`/admin/facilities/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteFacilityApi = async (id) => {
  const response = await api.delete(`/admin/facilities/${id}`);
  return response.data;
};
