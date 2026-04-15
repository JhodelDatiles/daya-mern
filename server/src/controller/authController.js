import User from "../model/userSchema.js";
import GhostUser from "../model/ghostUserSchema.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../envconfig.js";
import { sendVerificationEmail } from "../services/emailService.js";

// Cookies options
const getCookieOptions = () => {
  // Check if the app is running in production
  const isProduction = process.env.NODE_ENV === "production";

  // Return cookie configuration
  return {
    httpOnly: true, // Prevent JS access (XSS protection)
    sameSite: isProduction ? "none" : "lax", // Cross-site cookies for production
    secure: isProduction, // Only HTTPS in production
  };
};

// Tokens setter
const setTokenCookies = async (res, user) => {
  // Create access token (short-lived)
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    config.jwtAccessSecret,
    { expiresIn: "15m" },
  );

  // Create refresh token (long-lived)
  const refreshToken = jwt.sign({ id: user._id }, config.jwtRefreshSecret, {
    expiresIn: "7d",
  });

  // If user already has 5 tokens, remove the oldest one
  if (user.refreshToken.length >= 5) {
    user.refreshToken.shift();
  }

  // Add new refresh token to array
  user.refreshToken.push(refreshToken);

  // Save updated user
  await user.save();

  // Get cookie configuration
  const cookieOptions = getCookieOptions();

  // Set access token cookie
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { accessToken, refreshToken };
};

// Refresh token endpoint
export const refreshToken = async (req, res) => {
  // Get refresh token from cookies
  const token = req.cookies.refreshToken;

  // If no token, session expired
  if (!token) return res.status(401).json({ message: "Session expired" });

  try {
    // Verify refresh token
    const decoded = jwt.verify(token, config.jwtRefreshSecret);

    // Find user and include refreshToken field
    const user = await User.findById(decoded.id).select("+refreshToken");

    // Check if token exists in user's stored tokens
    if (!user || !user.refreshToken.includes(token)) {
      return res.status(401).json({ message: "Invalid or revoked session" });
    }

    // Generate new tokens and set cookies
    await setTokenCookies(res, user);

    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Register user
export const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if verified user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    // Check if ghost user exists
    let ghostUser = await GhostUser.findOne({ email });

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    if (ghostUser) {
      // Update existing ghost user
      ghostUser.username = username || ghostUser.username;
      ghostUser.password = password; // will be hashed via pre-save
      ghostUser.verification.token = token;
      ghostUser.verification.expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );

      await ghostUser.save();
      await sendVerificationEmail(ghostUser);

      return res.status(200).json({
        message: "Verification email resent.",
      });
    }

    // Create new ghost user
    const newGhostUser = await GhostUser.create({
      username,
      email,
      password,
      verification: {
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(newGhostUser);

    res.status(201).json({
      message: "Registration successful! Please verify your email.",
    });
  } catch (error) {
    console.error("Registration Failed", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password + refreshToken fields
    const user = await User.findOne({ email }).select(
      "+password +refreshToken",
    );

    // Ensure refreshToken array exists
    if (!user.refreshToken) {
      user.refreshToken = [];
    }

    // Limit stored refresh tokens to 5
    if (user.refreshToken.length >= 5) {
      user.refreshToken.shift();
    }

    // Validate credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email first.",
      });
    }

    // Generate tokens and set cookies
    await setTokenCookies(res, user);

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Authentication failed!", error);

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    // Get cookie options
    const options = getCookieOptions();

    // Remove refresh token from database
    if (refreshToken) {
      await User.updateOne(
        { refreshToken: { $in: [refreshToken] } },
        { $pull: { refreshToken: refreshToken } },
      );
    }

    // Clear cookies from browser
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const ghostUser = await GhostUser.findOne({
      "verification.token": token,
    }).select("+password");

    if (!ghostUser) {
      return res.status(400).json({
        message: "Invalid or expired token.",
      });
    }

    // Check expiration
    if (
      !ghostUser.verification?.expiresAt ||
      ghostUser.verification.expiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Token expired." });
    }

    // Create real user (IMPORTANT: password already hashed)
    const user = new User({
      username: ghostUser.username,
      email: ghostUser.email,
      password: ghostUser.password,
      isEmailVerified: true,
      status: "active",
    });

    // Prevent double hashing
    user.markModified("password");
    user.$locals = { skipHash: true };

    await user.save();

    // Delete ghost user
    await GhostUser.deleteOne({ _id: ghostUser._id });

    res.status(200).json({
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.error("Verification error:", error);

    res.status(500).json({
      message: "Verification failed",
      error: error.message,
    });
  }
};
