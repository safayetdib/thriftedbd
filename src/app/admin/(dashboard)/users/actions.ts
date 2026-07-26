"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createUserSchema, updateUserPasswordSchema } from "@/lib/validations/user.schema";
import { createUser, updateUserPassword, deleteUser } from "@/lib/services/user.service";

/** Admin-user management is superadmin-only. Returns the session on success. */
async function requireSuperAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function createUserAction(input: unknown) {
  await requireSuperAdminSession();
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await createUser(parsed.data);
    revalidatePath("/admin/users");
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return { error: "Email is already registered" };
    }
    return { error: err instanceof Error ? err.message : "Failed to create admin user" };
  }
}

export async function updateUserPasswordAction(id: string, input: unknown) {
  await requireSuperAdminSession();
  const parsed = updateUserPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await updateUserPassword(id, parsed.data.password);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to reset password" };
  }
}

export async function deleteUserAction(id: string) {
  const session = await requireSuperAdminSession();
  if (session.user.id === id) {
    return { error: "You cannot delete your own account" };
  }

  await connectDB();
  try {
    await deleteUser(id);
    revalidatePath("/admin/users");
  } catch (err) {
    if (err instanceof Error && err.message === "LAST_SUPERADMIN") {
      return { error: "Cannot delete the last superadmin" };
    }
    return { error: err instanceof Error ? err.message : "Failed to delete user" };
  }
}
