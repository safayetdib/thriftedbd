import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { cancelOrderSchema } from "@/lib/validations/order.schema";
import { cancelOrder } from "@/lib/services/order.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const parsed = cancelOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const session = await auth();
  try {
    const order = await cancelOrder(id, parsed.data, session?.user?.id);
    return NextResponse.json({ data: order });
  } catch (err) {
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "ORDER_NOT_CANCELLABLE") {
      return NextResponse.json(
        {
          error: {
            message: "Order can no longer be cancelled or returned",
            code: "ORDER_NOT_CANCELLABLE",
          },
        },
        { status: 409 },
      );
    }
    throw err;
  }
}
