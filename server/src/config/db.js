import mongoose from "mongoose";
import { config } from "../envconfig.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log("Succesfully connected to db!");
  } catch (error) {
    console.error("error", error.message);
    process.exit(1);
  }
};

export default connectDB;
