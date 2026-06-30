"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createColorSchema, updateColorSchema } from "@/lib/validations/color.schema";
import { createColor, updateColor, deactivateColor } from "@/lib/services/color.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
}

export async function createColorAction(input: unknown) {
  await requireAdminSession();
  const parsed = createColorSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await createColor(parsed.data);
    revalidatePath("/admin/colors");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create color" };
  }
}

export async function updateColorAction(id: string, input: unknown) {
  await requireAdminSession();
  const parsed = updateColorSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await updateColor(id, parsed.data);
    revalidatePath("/admin/colors");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update color" };
  }
}

export async function deactivateColorAction(id: string) {
  await requireAdminSession();
  await connectDB();
  await deactivateColor(id);
  revalidatePath("/admin/colors");
}
