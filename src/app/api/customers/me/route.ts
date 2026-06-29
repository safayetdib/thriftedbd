import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/api-auth";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/customer.schema";
import { getCustomerById, updateCustomerProfile } from "@/lib/services/customer.service";

export async function GET() {
  const unauthorized = await requireCustomer();
  if (unauthorized) return unauthorized;

  await connectDB();
  const session = await auth();
  const customer = await getCustomerById(session!.user.id);
  return NextResponse.json({ data: customer });
}

export async function PATCH(request: Request) {
  const unauthorized = await requireCustomer();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const session = await auth();
  const customer = await updateCustomerProfile(session!.user.id, parsed.data);
  return NextResponse.json({ data: customer });
}
