import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { resolveCartIdentity } from "@/lib/cart-identity";
import { createOrderSchema } from "@/lib/validations/order.schema";
import { createOrderFromCart } from "@/lib/services/order.service";
import Order from "@/models/Order";

/**
 * Public order tracking: GET by phone + orderNumber.
 * No login required — phone + orderNumber together are sufficient.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  const orderNumber = searchParams.get("orderNumber");

  if (!phone || !orderNumber) {
    return NextResponse.json(
      {
        error: { message: "Missing phone or orderNumber", code: "MISSING_PARAMS" },
      },
      { status: 400 },
    );
  }

  await connectDB();
  const order = await Order.findOne({
    "customer.phone": phone,
    orderNumber,
  }).lean();

  if (!order) {
    return NextResponse.json(
      { error: { message: "Order not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: order });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const identity = await resolveCartIdentity();
  const session = await auth();
  const customerId = session?.user?.role === "customer" ? session.user.id : undefined;

  try {
    const order = await createOrderFromCart(identity, parsed.data, customerId);
    return NextResponse.json({ data: order }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "CART_EMPTY") {
      return NextResponse.json(
        { error: { message: "Your cart is empty", code: "CART_EMPTY" } },
        { status: 400 },
      );
    }
    if (err instanceof Error && err.message === "PRODUCT_UNAVAILABLE") {
      return NextResponse.json(
        {
          error: {
            message: "One or more items in your cart are no longer available",
            code: "PRODUCT_UNAVAILABLE",
          },
        },
        { status: 409 },
      );
    }
    throw err;
  }
}
