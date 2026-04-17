import User from "../model/userSchema.js";
import GhostUser from "../model/ghostUserSchema.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../envconfig.js";
import { sendVerificationEmail } from "../services/emailService.js";

// GLOBAL EMAIL NORMALIZER
const normalizeEmail = (email) => email.toLowerCase().trim();

// Cookies options
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  };
};

// Tokens setter
const setTokenCookies = async (res, user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    config.jwtAccessSecret,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    config.jwtRefreshSecret,
    { expiresIn: "7d" }
  );

  if (user.refreshToken.length >= 5) {
    user.refreshToken.shift();
  }

  user.refreshToken.push(refreshToken);
  await user.save();

  const cookieOptions = getCookieOptions();

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

// Refresh token
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ message: "Session expired" });

  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret);

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || !user.refreshToken.includes(token)) {
      return res.status(401).json({ message: "Invalid or revoked session" });
    }

    await setTokenCookies(res, user);

    res.status(200).json({ message: "Token refreshed" });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    const normalizedEmail = normalizeEmail(email);

    const token = crypto.randomBytes(32).toString("hex");

    const ghostUser = await GhostUser.findOne({ email: normalizedEmail });

    if (ghostUser) {
      ghostUser.username = username || ghostUser.username;
      ghostUser.password = password;
      ghostUser.verification.token = token;
      ghostUser.verification.expiresAt = new Date(Date.now() + 86400000);
      ghostUser.verification.version += 1;

      await ghostUser.save();

      await sendVerificationEmail({
        user: ghostUser,
        token,
      });

      return res.json({ message: "Verification email resent." });
    }

    const newGhost = await GhostUser.create({
      username,
      email: normalizedEmail,
      password,
      verification: {
        token,
        expiresAt: new Date(Date.now() + 86400000),
        version: 1,
      },
    });

    await sendVerificationEmail({
      user: newGhost,
      token,
    });

    res.status(201).json({
      message: "Registration successful! Please verify your email.",
    });
  } catch (err) {
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password +refreshToken"
    );

    if (user) {
      if (!user.isVerified) {
        return res.status(403).json({
          message: "Please verify your email first",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      await setTokenCookies(res, user);
      return res.status(200).json({ message: "Login successful" });
    }

    const ghostUser = await GhostUser.findOne({ email: normalizedEmail });

    if (ghostUser) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    return res
      .status(404)
      .json({ message: "User not found, Please register first." });
  } catch (error) {
    console.error("Authentication failed!", error);

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const options = getCookieOptions();

    if (refreshToken) {
      await User.updateOne(
        { refreshToken: { $in: [refreshToken] } },
        { $pull: { refreshToken } }
      );
    }

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
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const user = new User({
      username: ghostUser.username,
      email: normalizeEmail(ghostUser.email),
      password: ghostUser.password,
      isVerified: true,
      status: "active",
    });

    user.$locals = { skipHash: true };

    await user.save();

    await GhostUser.deleteOne({ _id: ghostUser._id });

    return res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};

// Resend verification
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = normalizeEmail(email);

    const ghostUser = await GhostUser.findOne({ email: normalizedEmail });

    if (!ghostUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isExpired =
      ghostUser.verification.expiresAt < new Date();

    if (isExpired) {
      ghostUser.verification.token = crypto.randomBytes(32).toString("hex");
      ghostUser.verification.expiresAt = new Date(Date.now() + 86400000);
      ghostUser.verification.version += 1;

      await ghostUser.save();
    }

    await sendVerificationEmail({
      user: ghostUser,
      token: ghostUser.verification.token,
    });

    return res.json({ message: "Verification email sent!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};