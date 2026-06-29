import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signupSchema } from "@/lib/validations/customer.schema";
import { createCustomer } from "@/lib/services/customer.service";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const customer = await createCustomer(parsed.data);
    return NextResponse.json(
      { data: { id: customer._id, email: customer.email, name: customer.name } },
      { status: 201 },
    );
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
