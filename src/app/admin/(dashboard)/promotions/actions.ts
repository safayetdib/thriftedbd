"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createPromotionSchema, updatePromotionSchema } from "@/lib/validations/promotion.schema";
import {
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "@/lib/services/promotion.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
}

export async function createPromotionAction(input: unknown) {
  await requireAdminSession();
  const parsed = createPromotionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await createPromotion(parsed.data);
    revalidatePath("/admin/promotions");
    revalidatePath("/api/promotions");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create promotion" };
  }
}

export async function updatePromotionAction(id: string, input: unknown) {
  await requireAdminSession();
  const parsed = updatePromotionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await updatePromotion(id, parsed.data);
    revalidatePath("/admin/promotions");
    revalidatePath("/api/promotions");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update promotion" };
  }
}

export async function deletePromotionAction(id: string) {
  await requireAdminSession();
  await connectDB();
  await deletePromotion(id);
  revalidatePath("/admin/promotions");
  revalidatePath("/api/promotions");
}
