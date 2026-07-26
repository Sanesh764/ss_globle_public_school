import API from './api';

export const loginAdminApi = async (email, password) => {
  const response = await API.post('/admin/login', { email, password });
  return response.data;
};

export const getAdminProfileApi = async () => {
  const response = await API.get('/admin/me');
  return response.data;
};

export const logoutAdminApi = async () => {
  const response = await API.post('/admin/logout');
  return response.data;
};
