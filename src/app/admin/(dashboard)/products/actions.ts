"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  archiveProduct,
  createProduct,
  deleteProductPermanently,
  getProductById,
  updateProduct,
} from "@/lib/services/product.service";
import { deleteR2Object } from "@/lib/services/upload.service";
import { createProductSchema, updateProductSchema } from "@/lib/validations/product.schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
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
    const oldProduct = await getProductById(productId);
    const oldKeys = new Set<string>(
      (oldProduct?.images ?? []).map((img: unknown) => (img as { key: string }).key),
    );
    const newKeys = new Set<string>(
      (parsed.data.images ?? []).map((img: unknown) => String((img as { key: unknown }).key)),
    );
    const removedKeys = [...oldKeys].filter((k: string) => !newKeys.has(k));

    await updateProduct(productId, parsed.data);

    if (removedKeys.length) {
      await Promise.allSettled(removedKeys.map((key) => deleteR2Object(key)));
    }
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
  const product = await getProductById(productId);
  await archiveProduct(productId);
  if (product?.images?.length) {
    await Promise.allSettled(
      product.images.map((img: unknown) => deleteR2Object((img as { key: string }).key)),
    );
  }
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  redirect("/admin/products");
}

/**
 * Permanently deletes an ARCHIVED product and its R2 images. Exposed only on
 * archived rows in the list; the service also enforces archived-only.
 */
export async function deleteProductAction(productId: string) {
  await requireAdminSession();
  await connectDB();
  try {
    await deleteProductPermanently(productId);
    revalidatePath("/admin/products");
  } catch {
    // NOT_ARCHIVED / PRODUCT_NOT_FOUND - no-op (button only shows for archived).
  }
}
