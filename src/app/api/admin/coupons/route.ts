import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { createCouponSchema } from "@/lib/validations/coupon.schema";
import { createCoupon, getAllCoupons } from "@/lib/services/coupon.service";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");

  await connectDB();
  const result = await getAllCoupons({ page, limit });
  return NextResponse.json({ data: result });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = createCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const coupon = await createCoupon(parsed.data);
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: { message: "Coupon code already exists", code: "DUPLICATE_CODE" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
