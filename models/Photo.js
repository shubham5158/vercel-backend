// models/Photo.js
import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    cloudinaryPublicId: String,
    format: String,
    width: Number,
    height: Number
  },
  { timestamps: true }
);

export default mongoose.model("Photo", photoSchema);
