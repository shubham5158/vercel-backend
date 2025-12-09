// routes/downloadRoutes.js
import express from "express";
import DownloadToken from "../models/DownloadToken.js";
import Order from "../models/Order.js";
import Photo from "../models/Photo.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const getOriginalUrl = (id) =>
  cloudinary.url(id, {
    transformation: [{ quality: "auto", fetch_format: "auto" }]
  });

// Download images using token
router.get("/:token", async (req, res) => {
  try {
    const token = await DownloadToken.findOne({ token: req.params.token }).populate("order");

    if (!token) return res.status(404).json({ message: "Invalid token" });

    const order = await Order.findById(token.order._id);
    const photos = await Photo.find({ _id: { $in: order.selectedPhotoIds } });

    res.json({
      orderId: order._id,
      photos: photos.map((p) => ({
        id: p._id,
        url: getOriginalUrl(p.cloudinaryPublicId)
      }))
    });
  } catch {
    res.status(500).json({ message: "Download error" });
  }
});

export default router;
