import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
} from "../controller/authController.js";

const router = express.Router();

// Public Routes (with optional validation and rate limiting)
router.post("/register", register); // Add validation here later
router.post("/login", login); // Add rate limiting here later

// Session Management
router.post("/refresh-token", refreshToken);

// Protected Routes (The user must be logged in to hit these)
router.post("/logout", logout);

export default router;
