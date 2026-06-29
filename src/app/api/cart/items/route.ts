import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { resolveCartIdentity } from "@/lib/cart-identity";
import { addCartItemSchema } from "@/lib/validations/cart.schema";
import { addCartItem } from "@/lib/services/cart.service";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = addCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const identity = await resolveCartIdentity();

  try {
    const cart = await addCartItem(identity, parsed.data.productId);
    return NextResponse.json({ data: cart }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Product not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "PRODUCT_NOT_ACTIVE") {
      return NextResponse.json(
        { error: { message: "Product is no longer available", code: "PRODUCT_NOT_ACTIVE" } },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "PRODUCT_MISSING_IMAGE") {
      return NextResponse.json(
        { error: { message: "Product has no image yet", code: "PRODUCT_MISSING_IMAGE" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
