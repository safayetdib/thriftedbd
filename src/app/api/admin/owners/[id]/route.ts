import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { updateOwnerSchema } from "@/lib/validations/owner.schema";
import { updateOwner, deactivateOwner } from "@/lib/services/owner.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateOwnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const owner = await updateOwner(id, parsed.data);
  if (!owner) {
    return NextResponse.json(
      { error: { message: "Not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }
  return NextResponse.json({ data: owner });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await connectDB();
  const owner = await deactivateOwner(id);
  if (!owner) {
    return NextResponse.json(
      { error: { message: "Not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }
  return new NextResponse(null, { status: 204 });
}
