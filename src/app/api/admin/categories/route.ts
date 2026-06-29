import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { createCategorySchema } from "@/lib/validations/category.schema";
import { createCategory } from "@/lib/services/category.service";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const category = await createCategory(parsed.data);
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "PARENT_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Parent category not found", code: "PARENT_NOT_FOUND" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
