import axios from 'axios';

// In production (Vercel), VITE_API_URL = https://your-app.onrender.com
// In development, Vite proxy forwards /api → localhost:5000
const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const BASE_URL = apiOrigin ? `${apiOrigin}/api` : '/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
