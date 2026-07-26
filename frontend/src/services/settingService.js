import API from './api';

export const getSettingsApi = async () => {
  const response = await API.get('/settings');
  return response.data;
};

export const updateSettingsApi = async (formData) => {
  const response = await API.put('/settings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
