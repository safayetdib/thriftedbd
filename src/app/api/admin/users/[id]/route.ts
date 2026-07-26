import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { updateUserPasswordSchema } from "@/lib/validations/user.schema";
import { updateUserPassword, deleteUser } from "@/lib/services/user.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireSuperAdmin();
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

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireSuperAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await connectDB();
  try {
    await deleteUser(id);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "LAST_SUPERADMIN") {
      return NextResponse.json(
        { error: { message: "Cannot delete the last superadmin", code: "LAST_SUPERADMIN" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
