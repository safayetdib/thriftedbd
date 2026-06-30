"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createTransactionSchema } from "@/lib/validations/transaction.schema";
import {
  createTransaction,
  reconcileTransaction,
  voidTransaction,
} from "@/lib/services/transaction.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function createTransactionAction(input: unknown) {
  const session = await requireAdminSession();
  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await createTransaction(parsed.data, session.user.id);
    revalidatePath("/admin/transactions");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create transaction" };
  }
}

export async function reconcileTransactionAction(id: string) {
  await requireAdminSession();
  await connectDB();
  await reconcileTransaction(id);
  revalidatePath("/admin/transactions");
}

export async function voidTransactionAction(id: string) {
  await requireAdminSession();
  await connectDB();
  await voidTransaction(id);
  revalidatePath("/admin/transactions");
}
