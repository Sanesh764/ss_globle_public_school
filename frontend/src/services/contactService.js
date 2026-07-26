import API from './api';

export const submitContactApi = async (contactData) => {
  const response = await API.post('/contact', contactData);
  return response.data;
};

export const getContactMessagesApi = async (page = 1) => {
  const response = await API.get('/contact', { params: { page } });
  return response.data;
};

export const deleteContactMessageApi = async (id) => {
  const response = await API.delete(`/contact/${id}`);
  return response.data;
};

export const toggleReadMessageApi = async (id) => {
  const response = await API.put(`/contact/${id}/read`);
  return response.data;
};
