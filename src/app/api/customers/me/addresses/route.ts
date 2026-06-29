import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/api-auth";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { addAddressSchema } from "@/lib/validations/customer.schema";
import { addCustomerAddress } from "@/lib/services/customer.service";

export async function POST(request: Request) {
  const unauthorized = await requireCustomer();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = addAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const session = await auth();
  const customer = await addCustomerAddress(session!.user.id, parsed.data);
  return NextResponse.json({ data: customer.addresses }, { status: 201 });
}
