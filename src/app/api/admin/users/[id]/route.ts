import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { updateUserPasswordSchema } from "@/lib/validations/user.schema";
import { updateUserPassword } from "@/lib/services/user.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateUserPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const user = await updateUserPassword(id, parsed.data.password);
    return NextResponse.json({ data: user });
  } catch (err) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    throw err;
  }
}
