import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getProductBySlug } from "@/lib/services/product.service";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json(
      { error: { message: "Not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }
  return NextResponse.json({ data: product });
}
