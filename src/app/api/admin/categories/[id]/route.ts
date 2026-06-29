import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { updateCategorySchema } from "@/lib/validations/category.schema";
import { updateCategory, deactivateCategory } from "@/lib/services/category.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const category = await updateCategory(id, parsed.data);
  if (!category) {
    return NextResponse.json(
      { error: { message: "Not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }
  return NextResponse.json({ data: category });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await connectDB();
  const category = await deactivateCategory(id);
  if (!category) {
    return NextResponse.json(
      { error: { message: "Not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }
  return new NextResponse(null, { status: 204 });
}
