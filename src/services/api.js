import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://d3gw8tv95pui9q.cloudfront.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Let auth pages handle their own 401s (login, register, forgot-password, etc.)
      if (error.config?.url?.includes('/auth/')) {
        return Promise.reject(error);
      }
      // Token expired or invalid on a protected request
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use hash-based URL for HashRouter compatibility
      window.location.hash = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
