import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/api-auth";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { addFavorite, removeFavorite } from "@/lib/services/customer.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const unauthorized = await requireCustomer();
  if (unauthorized) return unauthorized;

  const { productId } = await params;
  await connectDB();
  const session = await auth();
  const customer = await addFavorite(session!.user.id, productId);
  return NextResponse.json({ data: customer });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const unauthorized = await requireCustomer();
  if (unauthorized) return unauthorized;

  const { productId } = await params;
  await connectDB();
  const session = await auth();
  const customer = await removeFavorite(session!.user.id, productId);
  return NextResponse.json({ data: customer });
}
