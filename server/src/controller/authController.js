import User from "../model/userSchema.js";
import GhostUser from "../model/ghostUserSchema.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../envconfig.js";
import { sendVerificationEmail } from "../services/emailService.js";

// GLOBAL EMAIL NORMALIZER
// takes email string from request (req.body)
// converts it to lowercase and trims spaces
// ensures consistency when storing and querying in database
const normalizeEmail = (email) => email.toLowerCase().trim();

// RESPONSE HELPERS
// sends error response back to client (frontend)
// res is Express response object, data goes back to browser
const errorResponse = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

// sends success response back to client
// optionally includes additional data payload
const successResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

// Cookies options
// determines cookie behavior based on environment
// used when sending tokens back to client browser
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true, // prevents JS access (security)
    sameSite: isProduction ? "none" : "lax", // cross-site handling
    secure: isProduction, // only HTTPS in production
  };
};

// Tokens setter
// creates JWT tokens and sends them to client as cookies
// data flow: user -> JWT -> cookies -> browser
const setTokenCookies = async (res, user) => {
  // create access token (short-lived)
  const accessToken = jwt.sign(
    { id: user._id, role: user.role }, // payload from user data
    config.jwtAccessSecret,
    { expiresIn: "15m" },
  );

  // create refresh token (long-lived)
  const refreshToken = jwt.sign({ id: user._id }, config.jwtRefreshSecret, {
    expiresIn: "7d",
  });

  // limit number of stored refresh tokens per user
  if (user.refreshToken.length >= 5) {
    user.refreshToken.shift();
  }

  // store new refresh token in database
  user.refreshToken.push(refreshToken);
  await user.save();

  const cookieOptions = getCookieOptions();

  // send access token to client browser via cookie
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // send refresh token to client browser via cookie
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

// Refresh token
// receives refresh token from cookies (req.cookies)
// verifies it and issues new access token
export const refreshToken = async (req, res) => {
  // get refresh token from client cookies
  const token = req.cookies.refreshToken;

  if (!token) {
    return errorResponse(res, 401, "Session expired");
  }

  try {
    // verify token using secret
    const decoded = jwt.verify(token, config.jwtRefreshSecret);

    // find user in database using decoded id
    const user = await User.findById(decoded.id).select("+refreshToken");

    // check if token exists in user's stored tokens
    if (!user || !user.refreshToken.includes(token)) {
      return errorResponse(res, 401, "Invalid or revoked session");
    }

    // generate new tokens and send to client
    await setTokenCookies(res, user);

    return successResponse(res, 200, "Token refreshed");
  } catch {
    return errorResponse(res, 401, "Invalid refresh token");
  }
};

// Register
// receives form data from frontend (req.body)
// creates or updates ghost user and sends verification email
export const register = async (req, res) => {
  try {
    // extract user input from request body (frontend form)
    const { username, email, password, confirmPassword } = req.body;

    // normalize email before database operations
    const normalizedEmail = normalizeEmail(email);

    // generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    // check if ghost user already exists in database
    const ghostUser = await GhostUser.findOne({ email: normalizedEmail });

    // if ghost user exists, update existing record
    if (ghostUser) {
      ghostUser.username = username || ghostUser.username;
      ghostUser.password = password;
      ghostUser.verification.token = token;
      ghostUser.verification.expiresAt = new Date(Date.now() + 15000);
      ghostUser.verification.version += 1;

      // save updated ghost user to database
      await ghostUser.save();

      // send verification email to user's email address
      await sendVerificationEmail({ user: ghostUser, token });

      return successResponse(res, 200, "Verification email resent.");
    }

    // debug check for expired link (only logs)
    if (ghostUser && ghostUser.verification.expiresAt < new Date()) {
      console.log("link expired");
    }

    // create new ghost user in database
    const newGhost = await GhostUser.create({
      username,
      email: normalizedEmail,
      password,
      verification: {
        token,
        expiresAt: new Date(Date.now() + 15000),
        version: 1,
      },
    });

    // send verification email to new user
    await sendVerificationEmail({ user: newGhost, token });

    return successResponse(
      res,
      201,
      "Registration successful! Please verify your email.",
    );
  } catch {
    return errorResponse(res, 500, "Internal server error");
  }
};

// Login
// receives credentials from frontend and authenticates user
export const login = async (req, res) => {
  try {
    // extract email and password from request
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    // find user in database including hidden fields
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password +refreshToken",
    );

    // if user exists
    if (user) {
      // check if email is verified
      if (!user.isVerified) {
        return errorResponse(
          res,
          403,
          "Invalid credentials or unverified account",
        );
      }

      // compare entered password with hashed password in database
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return errorResponse(res, 401, "Invalid credentials");
      }

      // generate tokens and send to client
      await setTokenCookies(res, user);

      return successResponse(res, 200, "Login successful");
    }

    // check if user exists in ghost collection (not verified yet)
    const ghostUser = await GhostUser.findOne({ email: normalizedEmail });

    if (ghostUser) {
      return errorResponse(
        res,
        401,
        "Invalid credentials or unverified account",
      );
    }

    // fallback if user not found
    return errorResponse(res, 401, "Invalid credentials");
  } catch {
    return errorResponse(res, 500, "Internal server error");
  }
};

// Logout
// removes refresh token from database and clears cookies
export const logout = async (req, res, next) => {
  try {
    // get refresh token from client cookies
    const refreshToken = req.cookies.refreshToken;

    const options = getCookieOptions();

    // remove token from database if exists
    if (refreshToken) {
      await User.updateOne(
        { refreshToken: { $in: [refreshToken] } },
        { $pull: { refreshToken } },
      );
    }

    // clear cookies from browser
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return successResponse(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

// Verify email
// receives token from URL (req.params)
// verifies ghost user and creates real user
export const verifyEmail = async (req, res) => {
  try {
    // get token from URL parameter
    const { token } = req.params;

    console.log("=== VERIFY EMAIL ATTEMPT ===");
    console.log("Token received:", token);
    console.log("Time now:", new Date());

    // find ghost user using verification token
    const ghostUser = await GhostUser.findOne({
      "verification.token": token,
    }).select("+password");

    // if no matching token found
    if (!ghostUser) {
      console.log("No ghost user found");
      return errorResponse(
        res,
        400,
        "Invalid or already used verification link",
      );
    }

    console.log("Ghost user found:", ghostUser.email);

    // check if token expired
    if (ghostUser.verification.expiresAt < new Date()) {
      return errorResponse(
        res,
        400,
        "Verification link expired. Please request a new one.",
      );
    }

    // check if user already exists in main collection
    const existingUser = await User.findOne({
      email: ghostUser.email,
    });

    if (existingUser) {
      // cleanup ghost user
      await GhostUser.deleteOne({ _id: ghostUser._id });

      return successResponse(
        res,
        200,
        "Account already verified. You can now log in.",
      );
    }

    // create new user from ghost user data
    const user = new User({
      username: ghostUser.username,
      email: ghostUser.email,
      password: ghostUser.password,
      isVerified: true,
      status: "active",
    });

    // skip hashing because password is already hashed
    user.$locals = { skipHash: true };

    // save user to database
    await user.save();

    // delete ghost user after successful verification
    await GhostUser.deleteOne({ _id: ghostUser._id });

    return successResponse(res, 200, "Email verified successfully!");
  } catch (error) {
    console.error("Verification error:", error);

    return errorResponse(res, 500, "Verification failed");
  }
};

// Resend verification
// receives email from frontend and resends verification link
export const resendVerification = async (req, res) => {
  try {
    // extract email from request body
    const { email } = req.body;

    const normalizedEmail = normalizeEmail(email);

    // find ghost user in database
    const ghostUser = await GhostUser.findOne({ email: normalizedEmail });

    // if no ghost user found, return generic success (security)
    if (!ghostUser) {
      return successResponse(
        res,
        200,
        "If this email exists, a verification email has been sent.",
      );
    }

    // check if existing token is expired
    const isExpired = ghostUser.verification.expiresAt < new Date();

    // if expired, generate new token and update expiration
    if (isExpired) {
      ghostUser.verification.token = crypto.randomBytes(32).toString("hex");
      ghostUser.verification.expiresAt = new Date(Date.now() + 86400000);
      ghostUser.verification.version += 1;

      await ghostUser.save();
    }

    // send verification email
    await sendVerificationEmail({
      user: ghostUser,
      token: ghostUser.verification.token,
    });

    return successResponse(res, 200, "Verification email sent!");
  } catch {
    return errorResponse(res, 500, "Failed to resend email");
  }
};