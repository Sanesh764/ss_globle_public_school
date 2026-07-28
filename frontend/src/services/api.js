import axios from 'axios';

// Get production Railway backend URL or local Vite proxy based on environment
export const getBackendBaseUrl = () => {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocal) {
    return 'http://localhost:5000';
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }

  return 'https://ssgloblepublicschool-production.up.railway.app';
};

export const getApiBaseUrl = () => {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocal) {
    return '/api';
  }

  return import.meta.env.VITE_API_URL || 'https://ssgloblepublicschool-production.up.railway.app/api';
};

// Helper function to resolve image URLs cleanly in production
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/school.jpeg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If hosted on Amplify or production, resolve relative upload paths to Railway backend
  if (imagePath.startsWith('/uploads/')) {
    const backendHost = getBackendBaseUrl();
    return `${backendHost}${imagePath}`;
  }

  return imagePath;
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token from localStorage if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
