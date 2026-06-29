import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createTransactionSchema } from "@/lib/validations/transaction.schema";
import { getTransactions, createTransaction } from "@/lib/services/transaction.service";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  await connectDB();
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || undefined;
  const limit = Number(searchParams.get("limit")) || undefined;
  const status = searchParams.get("status") ?? undefined;
  const type = searchParams.get("type") ?? undefined;

  const {
    items,
    total,
    page: resolvedPage,
    limit: resolvedLimit,
  } = await getTransactions({ page, limit, status, type });

  return NextResponse.json({
    data: items,
    meta: { total, page: resolvedPage, limit: resolvedLimit },
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.message, code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  await connectDB();
  const session = await auth();
  const transaction = await createTransaction(parsed.data, session!.user.id);
  return NextResponse.json({ data: transaction }, { status: 201 });
}
