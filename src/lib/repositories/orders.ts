import { ObjectId, type ClientSession } from "mongodb";
import { getDb, isMongoConfigured } from "@/lib/mongo";
import type { OrderDoc, OrderItemDoc } from "./types";

export async function createOrder(input: {
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
  items: OrderItemDoc[];
}): Promise<string> {
  const db = await getDb();
  const now = new Date();
  const result = await db.collection<OrderDoc>("orders").insertOne({
    status: "pending",
    guestName: input.guestName,
    guestPhone: input.guestPhone,
    guestEmail: input.guestEmail,
    address: input.address,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    totalPaise: input.totalPaise,
    discountPaise: input.discountPaise,
    couponCode: input.couponCode,
    razorpayOrderId: null,
    razorpayPaymentId: null,
    items: input.items,
    createdAt: now,
    updatedAt: now,
  } as OrderDoc);
  return result.insertedId.toHexString();
}

export async function setOrderRazorpayOrderId(
  orderId: string,
  razorpayOrderId: string,
): Promise<void> {
  if (!ObjectId.isValid(orderId)) return;
  const db = await getDb();
  await db.collection<OrderDoc>("orders").updateOne(
    { _id: new ObjectId(orderId) },
    {
      $set: { razorpayOrderId, updatedAt: new Date() },
    },
  );
}

export async function findOrderById(
  orderId: string,
  session?: ClientSession,
): Promise<OrderDoc | null> {
  if (!ObjectId.isValid(orderId)) return null;
  const db = await getDb();
  return db
    .collection<OrderDoc>("orders")
    .findOne({ _id: new ObjectId(orderId) }, { session });
}

export async function findOrderByRazorpayOrderId(
  razorpayOrderId: string,
): Promise<OrderDoc | null> {
  if (!isMongoConfigured()) return null;
  const db = await getDb();
  return db.collection<OrderDoc>("orders").findOne({ razorpayOrderId });
}

export async function listOrdersAdmin(): Promise<OrderDoc[]> {
  if (!isMongoConfigured()) return [];
  const db = await getDb();
  return db
    .collection<OrderDoc>("orders")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

export async function updateOrderStatus(
  orderId: string,
  fields: {
    status: OrderDoc["status"];
    razorpayPaymentId?: string | null;
  },
  session?: ClientSession,
): Promise<void> {
  if (!ObjectId.isValid(orderId)) return;
  const db = await getDb();
  const $set: Record<string, unknown> = {
    status: fields.status,
    updatedAt: new Date(),
  };
  if (fields.razorpayPaymentId !== undefined) {
    $set.razorpayPaymentId = fields.razorpayPaymentId;
  }
  await db
    .collection<OrderDoc>("orders")
    .updateOne({ _id: new ObjectId(orderId) }, { $set }, { session });
}
