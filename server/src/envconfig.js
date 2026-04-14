import dotenv from "dotenv";

dotenv.config();

// const isProduction = process.env.NODE_ENV === "production";

export const config = {
  mongoUri: process.env.MONGO_URI, // MongoDB URI
  port: process.env.PORT || 5000, // PORT
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173", // Client URL's
  serverUrl: process.env.SERVER_URL || "http://localhost:5000/api", // Server URL's
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET, // jwt access secret
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET, // jwt refresh secret
  emailFrom: process.env.EMAIL_FROM, // sender email
  brevoApiKey: process.env.BREVO_API_KEY, // sender api key (Brevo)
  
};
