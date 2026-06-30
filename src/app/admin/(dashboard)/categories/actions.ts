"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createCategorySchema, updateCategorySchema } from "@/lib/validations/category.schema";
import {
  createCategory,
  updateCategory,
  deactivateCategory,
} from "@/lib/services/category.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
}

export async function createCategoryAction(input: unknown) {
  await requireAdminSession();
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await createCategory(parsed.data);
    revalidatePath("/admin/categories");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create category" };
  }
}

export async function updateCategoryAction(id: string, input: unknown) {
  await requireAdminSession();
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await updateCategory(id, parsed.data);
    revalidatePath("/admin/categories");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update category" };
  }
}

export async function deactivateCategoryAction(id: string) {
  await requireAdminSession();
  await connectDB();
  await deactivateCategory(id);
  revalidatePath("/admin/categories");
}
