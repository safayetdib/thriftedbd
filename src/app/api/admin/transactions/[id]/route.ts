import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { updateTransactionSchema } from "@/lib/validations/transaction.schema";
import {
  getTransactionById,
  updateTransaction,
  voidTransaction,
} from "@/lib/services/transaction.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await connectDB();
  const transaction = await getTransactionById(id);
  if (!transaction) {
    return NextResponse.json(
      { error: { message: "Not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }
  return NextResponse.json({ data: transaction });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const transaction = await updateTransaction(id, parsed.data);
    return NextResponse.json({ data: transaction });
  } catch (err) {
    if (err instanceof Error && err.message === "TRANSACTION_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "TRANSACTION_NOT_EDITABLE") {
      return NextResponse.json(
        {
          error: {
            message: "Only PENDING transactions can be edited",
            code: "TRANSACTION_NOT_EDITABLE",
          },
        },
        { status: 409 },
      );
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await connectDB();
  try {
    await voidTransaction(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Error && err.message === "TRANSACTION_NOT_FOUND") {
      return NextResponse.json(
        { error: { message: "Not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "TRANSACTION_NOT_VOIDABLE") {
      return NextResponse.json(
        {
          error: {
            message: "Only PENDING transactions can be voided",
            code: "TRANSACTION_NOT_VOIDABLE",
          },
        },
        { status: 409 },
      );
    }
    throw err;
  }
}
