// routes/eventRoutes.js
import express from "express";
import crypto from "crypto";
import auth from "../middleware/auth.js";
import Event from "../models/Event.js";

const router = express.Router();

function generateGalleryCode() {
  return crypto.randomBytes(4).toString("hex");
}

// Create event (belongs to logged-in admin)
router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      clientName,
      clientEmail,
      eventDate,
      location,
      basePricePerPhoto,
      expiresAt,
    } = req.body;

    let galleryCode;
    while (true) {
      const tempCode = generateGalleryCode();
      const exists = await Event.findOne({ galleryCode: tempCode });
      if (!exists) {
        galleryCode = tempCode;
        break;
      }
    }

    const event = await Event.create({
      name,
      clientName,
      clientEmail,
      eventDate,
      location,
      basePricePerPhoto,
      galleryCode,
      expiresAt,
      createdBy: req.user.id, // ⭐ OWNER
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ message: "Create event error" });
  }
});

// Get all events for THIS admin only
router.get("/", auth, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(events);
  } catch (err) {
    console.error("Fetch events error:", err);
    res.status(500).json({ message: "Fetch events error" });
  }
});

// Get single event – only if it belongs to this admin
router.get("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });
    if (!event) return res.status(404).json({ message: "Not found" });

    res.json(event);
  } catch (err) {
    console.error("Get event error:", err);
    res.status(500).json({ message: "Get event error" });
  }
});

// Update event – only own events
router.patch("/:id", auth, async (req, res) => {
  try {
    const updated = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });

    res.json(updated);
  } catch (err) {
    console.error("Update event error:", err);
    res.status(500).json({ message: "Update event error" });
  }
});

// Delete event – only own events
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Event.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ message: "Delete event error" });
  }
});

export default router;
