import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Cookies options
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction, //boolean
  };
};
// Tokens setter
const setTokenCookies = async (res, user) => {
  // Access token creation
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );
  // Refresh token creation
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  // Save the refresh token to the database
  user.refreshToken = refreshToken;
  await user.save();

  // Set the cookies options
  const cookieOptions = getCookieOptions();

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "Session expired" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Find user and explicitly select the refreshToken field
    const user = await User.findById(decoded.id).select("+refreshToken");

    // SECURITY CHECK: Does the cookie token match the DB token?
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: "Invalid or revoked session" });
    }

    // Create new tokens (Rotate them)
    // This calls setTokenCookies which saves the NEW token to DB
    await setTokenCookies(res, user);

    res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(409).json({ message: "User already exists!" });
    // If user does not exist in the db create the user
    const user = await User.create({
      email,
      password,
    });
    //Success message
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error("Registration Failed", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Look for the email in the db
    const user = await User.findOne({ email });
    // compage the email password to the password user input
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    setTokenCookies(res, user);
    // Success message
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Authentication failed!", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const options = getCookieOptions();

    // 1. REVOKE on the server
    if (refreshToken) {
      // We find the user who owns THIS specific token and wipe it
      await User.updateOne(
        { refreshToken: refreshToken },
        { $unset: { refreshToken: "" } },
      );
    }

    // 2. CLEAR from the browser
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
