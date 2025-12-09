// models/DiscountRule.js
import mongoose from "mongoose";

const tierSchema = new mongoose.Schema(
  {
    minQty: Number,
    maxQty: Number,
    discountPercent: Number
  },
  { _id: false }
);

const ruleSchema = new mongoose.Schema(
  {
    name: String,
    isGlobal: Boolean,
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    tiers: [tierSchema]
  },
  { timestamps: true }
);

export default mongoose.model("DiscountRule", ruleSchema);
