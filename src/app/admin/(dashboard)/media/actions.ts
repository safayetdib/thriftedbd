"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { deleteMedia } from "@/lib/services/media.service";
import { revalidatePath } from "next/cache";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("UNAUTHORIZED");
  }
}

export async function deleteMediaAction(key: string) {
  await requireAdminSession();
  await connectDB();
  try {
    await deleteMedia(key);
    revalidatePath("/admin/media");
  } catch {
    // IN_USE (blocked in the UI too) or a transient R2 error - no-op so the
    // page just refreshes without deleting.
  }
}
