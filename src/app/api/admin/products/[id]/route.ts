import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { updateProductSchema } from "@/lib/validations/product.schema";
import { updateProduct, archiveProduct } from "@/lib/services/product.service";

const REFERENCE_NOT_FOUND_CODES = new Set([
  "CATEGORY_NOT_FOUND",
  "COLOR_NOT_FOUND",
  "OWNER_NOT_FOUND",
]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const product = await updateProduct(id, parsed.data);
    if (!product) {
      return NextResponse.json(
        { error: { message: "Not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: product });
  } catch (err) {
    if (err instanceof Error && REFERENCE_NOT_FOUND_CODES.has(err.message)) {
      return NextResponse.json(
        { error: { message: err.message, code: err.message } },
        { status: 409 },
      );
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await connectDB();
  const product = await archiveProduct(id);
  if (!product) {
    return NextResponse.json(
      { error: { message: "Not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }
  return new NextResponse(null, { status: 204 });
}
