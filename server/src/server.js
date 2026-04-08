import express from "express";
import connectDB from "./config/db.js";
import { config } from "./envconfig.js";
import cookieParser from "cookie-parser";

// Import routes
import authRoutes from "./router/authRoutes.js";

const app = express();

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);

const startServer = async () => {
  await connectDB(); //wait to connect to db
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
};
startServer();
