import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect to login if the error is 401 and we are NOT already on the login page
    // and the request is NOT a login/register attempt (to allow local error handling)
    const isLoginPath = typeof window !== 'undefined' && window.location.pathname === '/login';
    const isAuthRequest = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/register');

    if (err.response?.status === 401 && !isLoginPath && !isAuthRequest && typeof window !== 'undefined') {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
