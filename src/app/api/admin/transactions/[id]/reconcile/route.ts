import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { reconcileTransaction } from "@/lib/services/transaction.service";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await connectDB();
  try {
    const transaction = await reconcileTransaction(id);
    return NextResponse.json({ data: transaction });
  } catch (err) {
    if (err instanceof Error && err.message === "TRANSACTION_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "ALREADY_RECONCILED") {
      return NextResponse.json(
        { error: { message: "Transaction already reconciled", code: "ALREADY_RECONCILED" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
