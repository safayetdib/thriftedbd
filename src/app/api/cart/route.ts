import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { resolveCartIdentity } from "@/lib/cart-identity";
import { getCart } from "@/lib/services/cart.service";

export async function GET() {
  await connectDB();
  const identity = await resolveCartIdentity();
  const cart = await getCart(identity);
  return NextResponse.json({ data: cart ?? { items: [] } });
}
