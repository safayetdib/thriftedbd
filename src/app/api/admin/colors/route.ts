import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { createColorSchema } from "@/lib/validations/color.schema";
import { createColor } from "@/lib/services/color.service";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = createColorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const color = await createColor(parsed.data);
    return NextResponse.json({ data: color }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: { message: "Color name already exists", code: "DUPLICATE_NAME" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
