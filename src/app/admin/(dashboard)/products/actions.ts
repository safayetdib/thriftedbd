"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createProductSchema, updateProductSchema } from "@/lib/validations/product.schema";
import { createProduct, updateProduct, archiveProduct } from "@/lib/services/product.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function createProductAction(input: unknown) {
  await requireAdminSession();
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDB();
  try {
    const product = await createProduct(parsed.data);
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return { data: { id: String(product._id) } };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create product" };
  }
}

export async function updateProductAction(productId: string, input: unknown) {
  await requireAdminSession();
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDB();
  try {
    await updateProduct(productId, parsed.data);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    return { data: { id: productId } };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update product" };
  }
}

export async function archiveProductAction(productId: string) {
  await requireAdminSession();
  await connectDB();
  await archiveProduct(productId);
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  redirect("/admin/products");
}
