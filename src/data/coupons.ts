import type { Coupon } from "@/domain/coupons";

/** Fallback occasion offers when MongoDB coupons are empty / offline. */
export const SEED_COUPONS: Coupon[] = [
  {
    code: "WELCOME10",
    occasionLabel: "Welcome",
    description: "10% off your first soft ritual — min ₹500.",
    discountType: "percent",
    percentOff: 10,
    amountPaise: null,
    minOrderPaise: 50000,
    startsAt: null,
    endsAt: null,
    isActive: true,
  },
  {
    code: "DIWALI15",
    occasionLabel: "Diwali",
    description: "15% off festive glow edits — min ₹999.",
    discountType: "percent",
    percentOff: 15,
    amountPaise: null,
    minOrderPaise: 99900,
    startsAt: null,
    endsAt: null,
    isActive: true,
  },
  {
    code: "NEWYEAR200",
    occasionLabel: "New Year",
    description: "Flat ₹200 off — min ₹1,499.",
    discountType: "flat",
    percentOff: null,
    amountPaise: 20000,
    minOrderPaise: 149900,
    startsAt: null,
    endsAt: null,
    isActive: true,
  },
];
