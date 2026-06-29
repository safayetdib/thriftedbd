import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/api-auth";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { removeCustomerAddress } from "@/lib/services/customer.service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ index: string }> },
) {
  const unauthorized = await requireCustomer();
  if (unauthorized) return unauthorized;

  const { index } = await params;
  await connectDB();
  const session = await auth();
  try {
    const customer = await removeCustomerAddress(session!.user.id, Number(index));
    return NextResponse.json({ data: customer.addresses });
  } catch (err) {
    if (err instanceof Error && err.message === "ADDRESS_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    throw err;
  }
}
