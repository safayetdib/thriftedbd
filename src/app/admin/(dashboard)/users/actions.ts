"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createUserSchema, updateUserPasswordSchema } from "@/lib/validations/user.schema";
import { createUser, updateUserPassword } from "@/lib/services/user.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
}

export async function createUserAction(input: unknown) {
  await requireAdminSession();
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await createUser(parsed.data);
    revalidatePath("/admin/users");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create admin user" };
  }
}

export async function updateUserPasswordAction(id: string, input: unknown) {
  await requireAdminSession();
  const parsed = updateUserPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await updateUserPassword(id, parsed.data.password);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to reset password" };
  }
}
