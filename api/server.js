import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db.js";

// Import routes
import authRoutes from "../routes/authRoutes.js";
import eventRoutes from "../routes/eventRoutes.js";
import photoRoutes from "../routes/photoRoutes.js";
import discountRoutes from "../routes/discountRoutes.js";
import galleryRoutes from "../routes/galleryRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import downloadRoutes from "../routes/downloadRoutes.js";

const app = express();

// CORS (important for Vercel)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json({ limit: "10mb" }));

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/download", downloadRoutes);

app.get("/", (req, res) => res.send("Photo backend running on Vercel"));

let isConnected = false;

// Handle DB for serverless
async function ensureDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

// ❗ Vercel requires this exact handler export
export default async function handler(req, res) {
  await ensureDB();
  app(req, res);
}
