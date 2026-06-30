"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createBlacklistSchema, updateBlacklistSchema } from "@/lib/validations/blacklist.schema";
import {
  createBlacklistEntry,
  updateBlacklistEntry,
  deactivateBlacklistEntry,
} from "@/lib/services/blacklist.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function createBlacklistAction(input: unknown) {
  const session = await requireAdminSession();
  const parsed = createBlacklistSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await createBlacklistEntry(parsed.data, session.user.id);
    revalidatePath("/admin/blacklist");
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) {
      return { error: "Phone is already blacklisted" };
    }
    return { error: err instanceof Error ? err.message : "Failed to create blacklist entry" };
  }
}

export async function updateBlacklistAction(id: string, input: unknown) {
  await requireAdminSession();
  const parsed = updateBlacklistSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await updateBlacklistEntry(id, parsed.data);
    revalidatePath("/admin/blacklist");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update blacklist entry" };
  }
}

export async function deactivateBlacklistAction(id: string) {
  await requireAdminSession();
  await connectDB();
  await deactivateBlacklistEntry(id);
  revalidatePath("/admin/blacklist");
}
