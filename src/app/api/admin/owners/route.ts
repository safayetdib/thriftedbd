import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { createOwnerSchema } from "@/lib/validations/owner.schema";
import { getActiveOwners, createOwner } from "@/lib/services/owner.service";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  await connectDB();
  const owners = await getActiveOwners();
  return NextResponse.json({ data: owners });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = createOwnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const owner = await createOwner(parsed.data);
  return NextResponse.json({ data: owner }, { status: 201 });
}
