import API from './api';

export const getPublicVideosApi = async (params = {}) => {
  const response = await API.get('/videos', { params });
  return response.data;
};

export const getPublicVideoByIdApi = async (id) => {
  const response = await API.get(`/videos/${id}`);
  return response.data;
};

export const getAdminVideosApi = async (params = {}) => {
  const response = await API.get('/admin/videos', { params });
  return response.data;
};

export const getVideoStatsApi = async () => {
  const response = await API.get('/admin/videos/stats');
  return response.data;
};

export const createVideoApi = async (videoData) => {
  const response = await API.post('/admin/videos', videoData);
  return response.data;
};

export const updateVideoApi = async (id, videoData) => {
  const response = await API.put(`/admin/videos/${id}`, videoData);
  return response.data;
};

export const deleteVideoApi = async (id) => {
  const response = await API.delete(`/admin/videos/${id}`);
  return response.data;
};

export const toggleVideoStatusApi = async (id) => {
  const response = await API.patch(`/admin/videos/${id}/toggle-status`);
  return response.data;
};

export const toggleVideoFeaturedApi = async (id) => {
  const response = await API.patch(`/admin/videos/${id}/toggle-featured`);
  return response.data;
};

export const bulkDeleteVideosApi = async (ids) => {
  const response = await API.post('/admin/videos/bulk-delete', { ids });
  return response.data;
};

export const bulkUpdateVideoStatusApi = async (ids, isActive) => {
  const response = await API.patch('/admin/videos/bulk-status', { ids, isActive });
  return response.data;
};

export const reorderVideosApi = async (orders) => {
  const response = await API.put('/admin/videos/reorder', { orders });
  return response.data;
};
