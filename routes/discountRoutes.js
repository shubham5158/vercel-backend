// routes/discountRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import DiscountRule from "../models/DiscountRule.js";

const router = express.Router();

// Get global rule
router.get("/global", auth, async (req, res) => {
  try {
    const rule = await DiscountRule.findOne({ isGlobal: true }).sort({ createdAt: -1 });
    res.json(rule);
  } catch {
    res.status(500).json({ message: "Get rule error" });
  }
});

// Update global rule
router.put("/global", auth, async (req, res) => {
  try {
    const { name, tiers } = req.body;

    let rule = await DiscountRule.findOne({ isGlobal: true });
    if (!rule) {
      rule = await DiscountRule.create({ name, isGlobal: true, tiers });
    } else {
      rule.name = name;
      rule.tiers = tiers;
      await rule.save();
    }

    res.json(rule);
  } catch {
    res.status(500).json({ message: "Update rule error" });
  }
});

export default router;
