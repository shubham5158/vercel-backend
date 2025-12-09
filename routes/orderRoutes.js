// routes/orderRoutes.js
import express from "express";
import crypto from "crypto";
import Event from "../models/Event.js";
import Photo from "../models/Photo.js";
import Order from "../models/Order.js";
import DownloadToken from "../models/DownloadToken.js";
import { calculatePricing } from "../utils/pricing.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// PUBLIC: Create order from gallery code
router.post("/gallery/:code", async (req, res) => {
  try {
    const { photoIds, clientEmail } = req.body;

    const event = await Event.findOne({ galleryCode: req.params.code });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const photos = await Photo.find({
      _id: { $in: photoIds },
      event: event._id,
    });

    const pricing = await calculatePricing(event, photos.length);

    // ⭐ Order belongs to the event owner
    const order = await Order.create({
      event: event._id,
      clientEmail,
      selectedPhotoIds: photoIds,
      quantity: pricing.quantity,
      grossAmount: pricing.gross,
      discountPercent: pricing.discountPercent,
      discountAmount: pricing.discountAmount,
      netAmount: pricing.net,
      status: "PAID",
      createdBy: event.createdBy, // ⭐ link to admin
    });

    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await DownloadToken.create({
      order: order._id,
      token,
      expiresAt,
      createdBy: event.createdBy, // ⭐ same admin
    });

    res.json({ orderId: order._id, downloadToken: token, expiresAt });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Order error", error: err.message });
  }
});

// ADMIN: list only MY orders
router.get("/admin", auth, async (req, res) => {
  try {
    const orders = await Order.find({ createdBy: req.user.id }).populate(
      "event"
    );

    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Get orders error" });
  }
});

export default router;
