// utils/pricing.js
import DiscountRule from "../models/DiscountRule.js";

export async function getApplicableRule(event) {
  if (event.discountRule)
    return DiscountRule.findById(event.discountRule);

  return DiscountRule.findOne({ isGlobal: true }).sort({ createdAt: -1 });
}

export function calculateDiscountPercent(rule, qty) {
  if (!rule) return 0;

  for (const t of rule.tiers) {
    if (qty >= t.minQty && qty <= t.maxQty) return t.discountPercent;
  }
  return 0;
}

export async function calculatePricing(event, qty) {
  const rule = await getApplicableRule(event);
  const gross = event.basePricePerPhoto * qty;
  const discountPercent = calculateDiscountPercent(rule, qty);
  const discountAmount = gross * discountPercent / 100;
  const net = gross - discountAmount;

  return {
    quantity: qty,
    basePrice: event.basePricePerPhoto,
    gross,
    discountPercent,
    discountAmount,
    net
  };
}
