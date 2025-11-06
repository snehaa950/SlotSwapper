import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import swapRoutes from "./routes/swapRoutes.js"; // 🆕 Import swap routes

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🟢 All routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", swapRoutes); // 🆕 Add swap routes (base path /api)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
