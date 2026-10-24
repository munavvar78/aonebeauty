import { NextResponse } from "next/server";
import { cartTotalPaise, revalidateCartAgainstStock, type Cart } from "@/domain/cart";
import { validateCheckout, type CheckoutInput } from "@/domain/checkout";
import { orderTotalFromItems } from "@/domain/orders";
import { getProductStockMap } from "@/lib/catalog";
import { applyCouponCode } from "@/lib/coupons";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { SEED_PRODUCTS } from "@/data/products";

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
  const db = createServiceRoleClient();

  if (!razorpay || !db) {
    return NextResponse.json({
      mode: "demo",
      message:
        "Configure Supabase and Razorpay env vars to create live test orders.",
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
    const { data: byId } = await db
      .from("products")
      .select("id, quantity, price_paise, name, slug")
      .eq("id", productId)
      .maybeSingle();

    if (!byId) {
      const seed = SEED_PRODUCTS.find((p) => p.id === line.productId);
      if (seed) {
        const { data: bySlug } = await db
          .from("products")
          .select("id, quantity, price_paise, name, slug")
          .eq("slug", seed.slug)
          .maybeSingle();
        if (!bySlug) {
          return NextResponse.json(
            { error: `Product ${line.name} is not in the database` },
            { status: 400 },
          );
        }
        productId = bySlug.id;
        if (bySlug.quantity < line.quantity) {
          return NextResponse.json(
            { error: `${line.name} has insufficient stock` },
            { status: 409 },
          );
        }
        resolvedLines.push({
          ...line,
          productId,
          unitPricePaise: bySlug.price_paise,
          name: bySlug.name,
        });
        continue;
      }
      return NextResponse.json(
        { error: `Unknown product ${line.productId}` },
        { status: 400 },
      );
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
      unitPricePaise: byId.price_paise,
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

  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      status: "pending",
      guest_name: checkoutResult.value.name,
      guest_phone: checkoutResult.value.phone,
      guest_email: checkoutResult.value.email ?? null,
      address: checkoutResult.value.address,
      city: checkoutResult.value.city,
      state: checkoutResult.value.state,
      pincode: checkoutResult.value.pincode,
      total_paise: finalPayable,
      coupon_code: finalCoupon,
      discount_paise: finalDiscount,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Could not create order" },
      { status: 500 },
    );
  }

  const { error: itemsError } = await db.from("order_items").insert(
    resolvedLines.map((line) => ({
      order_id: order.id,
      product_id: line.productId,
      name: line.name,
      unit_price_paise: line.unitPricePaise,
      quantity: line.quantity,
    })),
  );

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: finalPayable,
    currency: "INR",
    receipt: order.id.slice(0, 40),
    notes: { local_order_id: order.id },
  });

  await db
    .from("orders")
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq("id", order.id);

  return NextResponse.json({
    mode: "live",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    localOrderId: order.id,
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
