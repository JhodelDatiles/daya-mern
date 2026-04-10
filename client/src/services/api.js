import axios from 'axios';

const API_URL = import.meta.env.VITE_URL_DEV || 'http://localhost:5000/api';
// Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // This ensures that the error object passed to your 'catch' block 
    // contains the response data from your Backend.
    return Promise.reject(error); 
  }
);

// Auth API
export const AuthAPI = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },
}