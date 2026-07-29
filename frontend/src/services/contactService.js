import API from './api';

export const submitContactApi = async (contactData) => {
  const response = await API.post('/contact', contactData);
  return response.data;
};

export const getContactMessagesApi = async (params = {}) => {
  const response = await API.get('/admin/messages', { params });
  return response.data;
};

export const getContactMessageByIdApi = async (id) => {
  const response = await API.get(`/admin/messages/${id}`);
  return response.data;
};

export const markMessageAsReadApi = async (id) => {
  const response = await API.patch(`/admin/messages/${id}/read`);
  return response.data;
};

export const markMessageAsRepliedApi = async (id) => {
  const response = await API.patch(`/admin/messages/${id}/replied`);
  return response.data;
};

export const deleteContactMessageApi = async (id) => {
  const response = await API.delete(`/admin/messages/${id}`);
  return response.data;
};
