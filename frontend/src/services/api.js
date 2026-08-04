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
  if (!imagePath) return '/school.webp';
  if (typeof imagePath !== 'string') return '/school.webp';

  // Handle hero-4 image filename variations
  if (imagePath.includes('hero-4')) {
    return '/hero-4.jpg';
  }

  const backendHost = getBackendBaseUrl();

  // If DB contains a localhost / 127.0.0.1 URL but app is running in production, replace with backendHost
  if (imagePath.startsWith('http://localhost') || imagePath.startsWith('http://127.0.0.1')) {
    const isLocalClient =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (!isLocalClient) {
      // Replace http://localhost:5000/uploads/... with https://ssgloble.../uploads/...
      const relative = imagePath.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
      return `${backendHost}${relative}`;
    }
    return imagePath;
  }

  // Full HTTP/HTTPS external URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Relative uploaded backend image path: /uploads/...
  if (imagePath.startsWith('/uploads/')) {
    return `${backendHost}${imagePath}`;
  }

  // Ensure relative static paths start with '/'
  if (!imagePath.startsWith('/')) {
    return `/${imagePath}`;
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
        sessionStorage.setItem('sessionExpiredMsg', 'Your session has expired. Please sign in again.');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);



export default API;
