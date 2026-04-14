import axios from 'axios';
import Cookies from 'js-cookie';

// ── Axios Instance ─────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://full-stack-application-l1a2.onrender.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Request Interceptor: attach JWT ────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authkit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle 401 ──────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('authkit_token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Token Helpers ──────────────────────────────────────────────
export const setToken = (token) =>
  Cookies.set('authkit_token', token, {
    expires:  7,
    sameSite: 'strict',
    secure:   process.env.NODE_ENV === 'production',
  });

export const removeToken = () => Cookies.remove('authkit_token');
export const getToken    = ()  => Cookies.get('authkit_token');

// ── Auth API ───────────────────────────────────────────────────
export const authAPI = {
  register:      (data) => api.post('/api/auth/register', data),
  login:         (data) => api.post('/api/auth/login', data),
  getProfile:    ()     => api.get('/api/auth/profile'),
  updateProfile: (data) => api.patch('/api/auth/profile', data),
};

// ── Admin API (ADMIN role only) ────────────────────────────────
export const adminAPI = {
  getStats:   ()           => api.get('/admin/stats'),
  getUsers:   (params)     => api.get('/admin/users', { params }),
  changeRole: (id, role)   => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id)         => api.delete(`/admin/users/${id}`),
};

export default api;
