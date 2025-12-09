// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/download", downloadRoutes);

app.get("/", (req, res) => res.send("Photo backend running"));

const PORT = process.env.PORT || 5000;

console.log("TEST CHECK:", process.env.CLOUDINARY_API_KEY);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
