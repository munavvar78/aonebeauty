import { NextResponse } from "next/server";
import { cartTotalPaise, revalidateCartAgainstStock, type Cart } from "@/domain/cart";
import { validateCheckout, type CheckoutInput } from "@/domain/checkout";
import { orderTotalFromItems } from "@/domain/orders";
import { getProductStockMap } from "@/lib/catalog";
import { applyCouponCode } from "@/lib/coupons";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { isMongoConfigured } from "@/lib/mongo";
import { SEED_PRODUCTS } from "@/data/products";
import {
  findProductById,
  findProductBySlugAny,
} from "@/lib/repositories/products";
import {
  createOrder,
  setOrderRazorpayOrderId,
} from "@/lib/repositories/orders";

type Body = {
  cart: Cart;
  checkout: CheckoutInput;
  couponCode?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const checkoutResult = validateCheckout(body.checkout ?? ({} as CheckoutInput));
  if (!checkoutResult.ok) {
    return NextResponse.json(
      { error: "Invalid checkout", errors: checkoutResult.errors },
      { status: 400 },
    );
  }

  if (!body.cart?.lines?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const productIds = body.cart.lines.map((line) => line.productId);
  const stockMap = await getProductStockMap(productIds);
  const revalidated = revalidateCartAgainstStock(body.cart, stockMap);

  if (revalidated.lines.length === 0) {
    return NextResponse.json(
      { error: "All items are sold out" },
      { status: 409 },
    );
  }

  const subtotalPaise = cartTotalPaise(revalidated);
  const itemsTotal = orderTotalFromItems(
    revalidated.lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      unitPricePaise: line.unitPricePaise,
      quantity: line.quantity,
    })),
  );

  if (subtotalPaise !== itemsTotal || subtotalPaise <= 0) {
    return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });
  }

  let discountPaise = 0;
  let couponCode: string | null = null;
  let payablePaise = subtotalPaise;

  if (body.couponCode?.trim()) {
    const applied = await applyCouponCode(body.couponCode, subtotalPaise);
    if (!applied.ok) {
      return NextResponse.json({ error: applied.error }, { status: 400 });
    }
    discountPaise = applied.discountPaise;
    couponCode = applied.code;
    payablePaise = applied.payablePaise;
  }

  if (payablePaise < 100) {
    return NextResponse.json(
      {
        error:
          "Payable amount after discount is too low for Razorpay. Remove the coupon or add items.",
      },
      { status: 400 },
    );
  }

  const razorpay = getRazorpayClient();

  if (!razorpay || !isMongoConfigured()) {
    return NextResponse.json({
      mode: "demo",
      message:
        "Configure MONGODB_URI and Razorpay env vars to create live test orders.",
      amountPaise: payablePaise,
      subtotalPaise,
      discountPaise,
      couponCode,
      checkout: checkoutResult.value,
      lines: revalidated.lines,
    });
  }

  const resolvedLines = [];
  for (const line of revalidated.lines) {
    let productId = line.productId;
    let byId = await findProductById(productId);

    if (!byId) {
      const seed = SEED_PRODUCTS.find((p) => p.id === line.productId);
      if (seed) {
        const bySlug = await findProductBySlugAny(seed.slug);
        if (!bySlug) {
          return NextResponse.json(
            { error: `Product ${line.name} is not in the database` },
            { status: 400 },
          );
        }
        productId = bySlug._id.toHexString();
        byId = bySlug;
      } else {
        return NextResponse.json(
          { error: `Unknown product ${line.productId}` },
          { status: 400 },
        );
      }
    }

    if (byId.quantity < line.quantity) {
      return NextResponse.json(
        { error: `${line.name} has insufficient stock` },
        { status: 409 },
      );
    }

    resolvedLines.push({
      ...line,
      productId,
      unitPricePaise: byId.pricePaise,
      name: byId.name,
    });
  }

  const resolvedSubtotal = cartTotalPaise({ lines: resolvedLines });
  let finalDiscount = discountPaise;
  let finalCoupon = couponCode;
  let finalPayable = payablePaise;

  if (couponCode) {
    const reapplied = await applyCouponCode(couponCode, resolvedSubtotal);
    if (!reapplied.ok) {
      return NextResponse.json({ error: reapplied.error }, { status: 400 });
    }
    finalDiscount = reapplied.discountPaise;
    finalCoupon = reapplied.code;
    finalPayable = reapplied.payablePaise;
  } else {
    finalPayable = resolvedSubtotal;
  }

  if (finalPayable < 100) {
    return NextResponse.json(
      { error: "Payable amount after discount is too low for Razorpay." },
      { status: 400 },
    );
  }

  const orderId = await createOrder({
    guestName: checkoutResult.value.name,
    guestPhone: checkoutResult.value.phone,
    guestEmail: checkoutResult.value.email ?? null,
    address: checkoutResult.value.address,
    city: checkoutResult.value.city,
    state: checkoutResult.value.state,
    pincode: checkoutResult.value.pincode,
    totalPaise: finalPayable,
    discountPaise: finalDiscount,
    couponCode: finalCoupon,
    items: resolvedLines.map((line) => ({
      productId: line.productId,
      name: line.name,
      unitPricePaise: line.unitPricePaise,
      quantity: line.quantity,
    })),
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: finalPayable,
    currency: "INR",
    receipt: orderId.slice(0, 40),
    notes: { local_order_id: orderId },
  });

  await setOrderRazorpayOrderId(orderId, razorpayOrder.id);

  return NextResponse.json({
    mode: "live",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    localOrderId: orderId,
    razorpayOrderId: razorpayOrder.id,
    amountPaise: finalPayable,
    subtotalPaise: resolvedSubtotal,
    discountPaise: finalDiscount,
    couponCode: finalCoupon,
    currency: "INR",
    customer: {
      name: checkoutResult.value.name,
      email: checkoutResult.value.email,
      contact: checkoutResult.value.phone,
    },
  });
}
