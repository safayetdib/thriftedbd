import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getActiveProducts } from "@/lib/services/product.service";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || undefined;
  const limit = Number(searchParams.get("limit")) || undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const {
    items,
    total,
    page: resolvedPage,
    limit: resolvedLimit,
  } = await getActiveProducts({
    page,
    limit,
    categoryId,
  });

  return NextResponse.json({
    data: items,
    meta: { total, page: resolvedPage, limit: resolvedLimit },
  });
}
