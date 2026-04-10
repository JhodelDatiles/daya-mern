import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { config } from "./envconfig.js";
import cookieParser from "cookie-parser";

// Import routes
import authRoutes from "./router/authRoutes.js";

const app = express();

// ✅ CORS — must come BEFORE routes and body parsers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // your Vite dev port
    credentials: true, // required because Axios uses withCredentials: true
  })
);

app.use(express.json());
app.use(cookieParser()); // ✅ was imported but never used — needed for cookie-based auth

// API routes
app.use("/api/auth", authRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
};
startServer();