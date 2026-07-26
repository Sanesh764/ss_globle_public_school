import API from './api';

export const getGalleryApi = async (category) => {
  const response = await API.get('/gallery', { params: { category } });
  return response.data;
};

export const uploadGalleryApi = async (formData) => {
  const response = await API.post('/gallery', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteGalleryApi = async (id) => {
  const response = await API.delete(`/gallery/${id}`);
  return response.data;
};
