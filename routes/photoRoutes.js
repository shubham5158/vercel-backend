import express from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";
import Event from "../models/Event.js";
import Photo from "../models/Photo.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ⭐ FIXED — GET ROUTE (missing earlier)
router.get("/events/:eventId", auth, async (req, res) => {
  try {
    const photos = await Photo.find({ event: req.params.eventId }).lean();
    res.json(photos);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch photos",
      error: err.message,
    });
  }
});

// Existing POST route (upload)
router.post("/events/:eventId", auth, upload.array("photos", 50), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const uploadedPhotos = [];

    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `events/${event._id}`,
            resource_type: "image"
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(file.buffer);
      });

      const photo = await Photo.create({
        event: event._id,
        cloudinaryPublicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      });

      uploadedPhotos.push(photo);
    }

    res.status(201).json(uploadedPhotos);
  } catch (err) {
    res.status(500).json({ message: "Upload photos error", error: err.message });
  }
});

export default router;
