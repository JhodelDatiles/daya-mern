import axios from "axios";

// base API URL
// comes from Vite environment variable (VITE_SERVER_URL)
// if not defined, falls back to localhost
// this is where all frontend requests are sent (backend server)
const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000/api";

// create axios instance
// baseURL: prefix for all requests (e.g. /auth/login becomes full URL)
// withCredentials: allows cookies (accessToken, refreshToken) to be sent/received
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// INTERCEPTOR FIX
// this runs after every response from backend
// success: just return the response as-is
// error: extract message from backend and convert it into a standard Error object
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // tries to get error message from backend response
    // if backend does not provide one, fallback message is used
    const message = error.response?.data?.message || "Something went wrong";

    // reject with a new Error containing only the message
    // this simplifies error handling in components (error.message will always exist)
    return Promise.reject(new Error(message));
  },
);

// AUTH API METHODS
// each function calls backend endpoints and returns response data
export const AuthAPI = {
  // REGISTER
  // receives userData from frontend form (username, email, password, confirmPassword)
  // sends POST request to /auth/register
  // backend processes data and returns response
  register: async (userData) => {
    const res = await api.post("/auth/register", userData);

    // res.data contains backend response (success, message, etc.)
    return res.data;
  },

  // LOGIN
  // receives credentials (email, password) from frontend
  // sends POST request to /auth/login
  // backend validates and returns tokens via cookies + response message
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  },

  // LOGOUT
  // sends POST request to /auth/logout
  // backend clears cookies and removes refresh token from database
  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  // REFRESH TOKEN
  // sends POST request to /auth/refresh-token
  // backend verifies refresh token (from cookies) and issues new access token
  refreshToken: async () => {
    const res = await api.post("/auth/refresh-token");
    return res.data;
  },

  // VERIFY EMAIL
  // receives token from URL (frontend route parameter)
  // sends GET request to /auth/verify-email/:token
  // backend verifies token, creates user, deletes ghost user
  verifyEmail: async (token) => {
    const res = await api.get(`/auth/verify-email/${token}`);
    return res.data;
  },

  // RESEND VERIFICATION
  // receives email from frontend
  // sends POST request to /auth/resend-verification
  // backend generates new token if needed and sends email again
  resendVerification: async (email) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  },

  // FORGOT PASSWORD
  // receives email from frontend
  // sends POST request to /auth/forgot-password
  // backend checks if user exists (silently), generates reset token,
  // saves hashed token + expiry, and sends reset email if valid
  // always returns success message to prevent email enumeration attacks
  forgotPassword: async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  // RESET PASSWORD
  // receives token from URL + new password from frontend
  // sends POST request to /auth/reset-password/:token
  // backend hashes token, finds matching user with valid expiry,
  // updates password (handled by pre-save hook), and clears reset fields
  resetPassword: async (token, data) => {
    const res = await api.post(`/auth/reset-password/${token}`, data);
    return res.data;
  },
};
