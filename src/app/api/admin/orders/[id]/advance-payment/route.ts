import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { advancePaymentSchema } from "@/lib/validations/order.schema";
import { updateAdvancePayment } from "@/lib/services/order.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const parsed = advancePaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const order = await updateAdvancePayment(id, parsed.data);
    return NextResponse.json({ data: order });
  } catch (err) {
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "ORDER_NOT_PENDING") {
      return NextResponse.json(
        { error: { message: "Order is no longer pending", code: "ORDER_NOT_PENDING" } },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "PRODUCT_NO_LONGER_ACTIVE") {
      return NextResponse.json(
        {
          error: {
            message: "An item in this order is no longer available",
            code: "PRODUCT_NO_LONGER_ACTIVE",
          },
        },
        { status: 409 },
      );
    }
    throw err;
  }
}
