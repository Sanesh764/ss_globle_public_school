import API from './api';

export const getNoticesApi = async (params = {}) => {
  const response = await API.get('/notices', { params });
  return response.data;
};

export const getNoticeByIdApi = async (id) => {
  const response = await API.get(`/notices/${id}`);
  return response.data;
};

export const createNoticeApi = async (noticeData) => {
  const response = await API.post('/notices', noticeData);
  return response.data;
};

export const updateNoticeApi = async (id, noticeData) => {
  const response = await API.put(`/notices/${id}`, noticeData);
  return response.data;
};

export const deleteNoticeApi = async (id) => {
  const response = await API.delete(`/notices/${id}`);
  return response.data;
};
