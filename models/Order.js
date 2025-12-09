import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    clientEmail: String,
    selectedPhotoIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }],
    quantity: Number,
    grossAmount: Number,
    discountPercent: Number,
    discountAmount: Number,
    netAmount: Number,
    status: { type: String, default: "PAID" },

    // ⭐ Owner admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
