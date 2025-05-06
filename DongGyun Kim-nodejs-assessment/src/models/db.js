import mongoose from "mongoose";
import "dotenv/config";
import logger from "../utils/logger.js";

const connectDB = async (uri = process.env.DB_URL) => {
  await mongoose.connect(uri);
  logger.info("Connected to MongoDB");
};

export default connectDB;
