import api from './api';

export const getPublicAcademicResourcesApi = async () => {
  const response = await api.get('/academic-resources');
  return response.data;
};

export const getAdminAcademicResourcesApi = async () => {
  const response = await api.get('/admin/academic-resources');
  return response.data;
};

export const createAcademicResourceApi = async (formData) => {
  const response = await api.post('/admin/academic-resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateAcademicResourceApi = async (id, formData) => {
  const response = await api.put(`/admin/academic-resources/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteAcademicResourceApi = async (id) => {
  const response = await api.delete(`/admin/academic-resources/${id}`);
  return response.data;
};
