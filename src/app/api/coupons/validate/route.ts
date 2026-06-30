import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { validateCoupon } from "@/lib/services/coupon.service";
import { z } from "zod";

const validateCouponRequest = z.object({
  code: z.string().min(1),
  orderSubtotal: z.number().nonnegative(),
});

/**
 * Public: Validate a coupon code against an order subtotal.
 * Returns discount amount if valid, error message if not.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = validateCouponRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const result = await validateCoupon(parsed.data.code, parsed.data.orderSubtotal);
  return NextResponse.json({ data: result });
}
