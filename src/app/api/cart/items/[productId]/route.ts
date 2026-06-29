import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { resolveCartIdentity } from "@/lib/cart-identity";
import { removeCartItem } from "@/lib/services/cart.service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  await connectDB();
  const identity = await resolveCartIdentity();
  const { productId } = await params;

  try {
    const cart = await removeCartItem(identity, productId);
    return NextResponse.json({ data: cart });
  } catch (err) {
    if (err instanceof Error && err.message === "CART_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Cart not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    throw err;
  }
}
