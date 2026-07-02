import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "customer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const productId = body?.productId;
  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  await connectDB();
  const customer = await Customer.findById(session.user.id);
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const favs = customer.favoriteProductIds?.map(String) ?? [];
  const isFav = favs.includes(productId);

  if (isFav) {
    customer.favoriteProductIds = customer.favoriteProductIds.filter(
      (id: unknown) => String(id) !== productId,
    );
  } else {
    customer.favoriteProductIds.push(productId);
  }
  await customer.save();

  return NextResponse.json({ data: { isFavorited: !isFav } });
}
