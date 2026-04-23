import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "../controller/authController.js";

const router = express.Router();

// REGISTER
// creates a new user (or ghost user depending on your flow)
// triggers email verification process
router.post("/register", register);

// LOGIN
// authenticates user credentials and issues tokens (cookies)
// should later include rate limiting for brute-force protection
router.post("/login", login);

// VERIFY EMAIL
// receives token from email link
// validates token and activates user account
router.get("/verify-email/:token", verifyEmail);

// RESEND VERIFICATION
// resends verification email if user is still unverified
// should also include rate limiting to prevent abuse
router.post("/resend-verification", resendVerification);

// FORGOT PASSWORD
// receives email and triggers password reset flow
// generates reset token and sends email (silently if user exists)
router.post("/forgot-password", forgotPassword);

// RESET PASSWORD
// receives reset token + new password
// validates token + expiry, updates password, clears reset fields
router.post("/reset-password/:token", resetPassword);

// REFRESH TOKEN
// issues new access token using valid refresh token (from cookies)
router.post("/refresh-token", refreshToken);

// LOGOUT
// clears auth cookies and removes refresh token from database
// requires user to be authenticated
router.post("/logout", logout);

export default router;