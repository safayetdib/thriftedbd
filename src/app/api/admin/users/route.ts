import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { createUserSchema } from "@/lib/validations/user.schema";
import { getUsers, createUser } from "@/lib/services/user.service";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  await connectDB();
  const users = await getUsers();
  return NextResponse.json({ data: users });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const user = await createUser(parsed.data);
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: { message: "Email is already registered", code: "EMAIL_TAKEN" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
