import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: String,
    clientName: String,
    clientEmail: String,
    eventDate: String,
    location: String,
    basePricePerPhoto: Number,
    galleryCode: String,
    expiresAt: Date,

    // ⭐ VERY IMPORTANT: Who owns this event (which admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
