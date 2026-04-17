import axios from "axios";

// BASE API URL (from Vite env or fallback to localhost)
const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000/api";

// Axios instance (centralized HTTP client)
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // allows cookies (accessToken, refreshToken)
});

// Interceptor (response handler)
// - Returns response directly on success
// - Ensures backend error response is passed to catch block properly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

// AUTH API METHODS
export const AuthAPI = {
  // Register new user
  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
  },

  // Login user
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  },

  // Logout user (clears cookies + refresh token)
  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  // Refresh access token using refresh token cookie
  refreshToken: async () => {
    const res = await api.post("/auth/refresh-token");
    return res.data;
  },

  // Verify email using token from URL
  verifyEmail: async (token) => {
    const res = await api.get(`/auth/verify-email/${token}`);
    return res.data;
  },
  // Resend email verification 
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
};
