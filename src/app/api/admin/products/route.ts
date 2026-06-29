import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { createProductSchema } from "@/lib/validations/product.schema";
import { getAdminProducts, createProduct } from "@/lib/services/product.service";

const REFERENCE_NOT_FOUND_CODES = new Set([
  "CATEGORY_NOT_FOUND",
  "COLOR_NOT_FOUND",
  "OWNER_NOT_FOUND",
]);

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
  } = await getAdminProducts({
    page,
    limit,
    status,
  });

  return NextResponse.json({
    data: items,
    meta: { total, page: resolvedPage, limit: resolvedLimit },
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && REFERENCE_NOT_FOUND_CODES.has(err.message)) {
      return NextResponse.json(
        { error: { message: err.message, code: err.message } },
        { status: 409 },
      );
    }
    if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: { message: "Duplicate slug or SKU", code: "DUPLICATE" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
