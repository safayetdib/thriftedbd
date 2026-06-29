import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { getAdminOrders } from "@/lib/services/order.service";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  await connectDB();
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || undefined;
  const limit = Number(searchParams.get("limit")) || undefined;
  const status = searchParams.get("status") ?? undefined;

  const {
    items,
    total,
    page: resolvedPage,
    limit: resolvedLimit,
  } = await getAdminOrders({ page, limit, status });

  return NextResponse.json({
    data: items,
    meta: { total, page: resolvedPage, limit: resolvedLimit },
  });
}
