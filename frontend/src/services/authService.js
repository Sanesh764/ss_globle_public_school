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

// Staff Admin User Management API Calls
export const getStaffAdminsApi = async () => {
  const response = await API.get('/admin/users');
  return response.data;
};

export const createStaffAdminApi = async (userData) => {
  const response = await API.post('/admin/users', userData);
  return response.data;
};

export const updateStaffAdminApi = async (id, userData) => {
  const response = await API.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const resetStaffAdminPasswordApi = async (id, newPassword) => {
  const response = await API.patch(`/admin/users/${id}/reset-password`, { newPassword });
  return response.data;
};

export const deleteStaffAdminApi = async (id) => {
  const response = await API.delete(`/admin/users/${id}`);
  return response.data;
};
