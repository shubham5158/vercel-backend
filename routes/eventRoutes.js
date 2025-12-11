// routes/eventRoutes.js
import express from "express";
import crypto from "crypto";
import auth from "../middleware/auth.js";
import Event from "../models/Event.js";

const router = express.Router();

// Generate unique gallery code
function generateGalleryCode() {
  return crypto.randomBytes(4).toString("hex");
}

/* ---------------------------------------------
   CREATE EVENT (Admin Only)
---------------------------------------------- */
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

    // Generate unique gallery code
    let galleryCode;
    while (true) {
      const temp = generateGalleryCode();
      const exists = await Event.findOne({ galleryCode: temp });
      if (!exists) {
        galleryCode = temp;
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
      expiresAt,
      galleryCode,
      createdBy: req.user.id,
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ message: "Create event error" });
  }
});

/* ---------------------------------------------
   GET EVENTS (Search + Pagination ONLY)
---------------------------------------------- */
router.get("/", auth, async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
    } = req.query;

    const query = { createdBy: req.user.id };

    // 🔍 SIMPLE SEARCH across fields
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
        { clientEmail: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { galleryCode: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Get total count
    const total = await Event.countDocuments(query);

    // Fetch events
    const events = await Event.find(query)
      .sort({ createdAt: -1 }) // always newest first
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      events,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error("Fetch events error:", err);
    res.status(500).json({ message: "Fetch events error" });
  }
});

/* ---------------------------------------------
   GET SINGLE EVENT (Admin Only)
---------------------------------------------- */
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

/* ---------------------------------------------
   UPDATE EVENT (Admin Only)
---------------------------------------------- */
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

/* ---------------------------------------------
   DELETE EVENT (Admin Only)
---------------------------------------------- */
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
