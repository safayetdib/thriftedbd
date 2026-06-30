"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createOwnerSchema, updateOwnerSchema } from "@/lib/validations/owner.schema";
import { createOwner, updateOwner, deactivateOwner } from "@/lib/services/owner.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
}

export async function createOwnerAction(input: unknown) {
  await requireAdminSession();
  const parsed = createOwnerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await createOwner(parsed.data);
    revalidatePath("/admin/owners");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create owner" };
  }
}

export async function updateOwnerAction(id: string, input: unknown) {
  await requireAdminSession();
  const parsed = updateOwnerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await updateOwner(id, parsed.data);
    revalidatePath("/admin/owners");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update owner" };
  }
}

export async function deactivateOwnerAction(id: string) {
  await requireAdminSession();
  await connectDB();
  await deactivateOwner(id);
  revalidatePath("/admin/owners");
}
