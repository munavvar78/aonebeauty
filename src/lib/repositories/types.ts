import type { ObjectId } from "mongodb";
import type { ProductCategory } from "@/data/products";

export type ProductDoc = {
  _id: ObjectId;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  pricePaise: number;
  compareAtPricePaise: number | null;
  quantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  featured: boolean;
  imagePath: string | null;
  accentFrom: string;
  accentTo: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItemDoc = {
  productId: string;
  name: string;
  unitPricePaise: number;
  quantity: number;
};

export type OrderDoc = {
  _id: ObjectId;
  status: "pending" | "paid" | "failed" | "paid_out_of_stock";
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalPaise: number;
  discountPaise: number;
  couponCode: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  items: OrderItemDoc[];
  createdAt: Date;
  updatedAt: Date;
};

export type CouponDoc = {
  _id: ObjectId;
  code: string;
  occasionLabel: string;
  description: string;
  discountType: "percent" | "flat";
  percentOff: number | null;
  amountPaise: number | null;
  minOrderPaise: number;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
  createdAt: Date;
};

export type StockMovementDoc = {
  _id: ObjectId;
  productId: string;
  delta: number;
  reason: "restock" | "adjustment" | "sale" | "sale_reversal";
  note: string | null;
  orderId: string | null;
  createdAt: Date;
};

export type AppliedPaymentDoc = {
  _id: ObjectId;
  paymentId: string;
  orderId: string;
  appliedAt: Date;
};

export type AdminDoc = {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  createdAt: Date;
};
