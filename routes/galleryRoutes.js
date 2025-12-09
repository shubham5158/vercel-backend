// routes/galleryRoutes.js
import express from "express";
import Event from "../models/Event.js";
import Photo from "../models/Photo.js";
import cloudinary from "../config/cloudinary.js";
import { calculatePricing } from "../utils/pricing.js";

const router = express.Router();

// Generate watermarked preview
const getWatermarkedUrl = (id) => {
  return cloudinary.url(id, {
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      {
        overlay: process.env.CLOUDINARY_WATERMARK_PUBLIC_ID,
        gravity: "south_east",
        opacity: 60,
        width: 0.25,
        crop: "scale"
      }
    ]
  });
};

// Public gallery access
router.get("/:code", async (req, res) => {
  try {
    const event = await Event.findOne({ galleryCode: req.params.code });
    if (!event) return res.status(404).json({ message: "Gallery not found" });

    const photos = await Photo.find({ event: event._id });

    res.json({
      event,
      photos: photos.map((p) => ({
        id: p._id,
        width: p.width,
        height: p.height,
        watermarkedUrl: getWatermarkedUrl(p.cloudinaryPublicId)
      }))
    });
  } catch {
    res.status(500).json({ message: "Gallery load error" });
  }
});

// Price preview
router.post("/:code/price-preview", async (req, res) => {
  try {
    const { photoIds } = req.body;

    const event = await Event.findOne({ galleryCode: req.params.code });
    if (!event) return res.status(404).json({ message: "Not found" });

    const pricing = await calculatePricing(event, photoIds.length);
    res.json(pricing);
  } catch {
    res.status(500).json({ message: "Price preview error" });
  }
});

export default router;
