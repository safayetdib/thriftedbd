import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { advanceOrderStatusSchema } from "@/lib/validations/order.schema";
import { advanceOrderStatus } from "@/lib/services/order.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const parsed = advanceOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const session = await auth();
  try {
    const order = await advanceOrderStatus(id, parsed.data, session?.user?.id);
    return NextResponse.json({ data: order });
  } catch (err) {
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "INVALID_TRANSITION") {
      return NextResponse.json(
        {
          error: {
            message: "Order must move through fulfillment stages one at a time",
            code: "INVALID_TRANSITION",
          },
        },
        { status: 409 },
      );
    }
    throw err;
  }
}
