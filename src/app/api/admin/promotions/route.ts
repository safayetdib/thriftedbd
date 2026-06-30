import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { createPromotionSchema } from "@/lib/validations/promotion.schema";
import { createPromotion, getAllPromotions } from "@/lib/services/promotion.service";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");

  await connectDB();
  const result = await getAllPromotions({ page, limit });
  return NextResponse.json({ data: result });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = createPromotionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const promotion = await createPromotion(parsed.data);
    return NextResponse.json({ data: promotion }, { status: 201 });
  } catch (err) {
    throw err;
  }
}
