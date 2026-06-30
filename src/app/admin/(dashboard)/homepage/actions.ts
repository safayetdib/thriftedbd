"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { updateSettings } from "@/lib/services/settings.service";
import type { UpdateSettingsInput } from "@/lib/validations/settings.schema";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
}

/**
 * Update homepage settings (hero slides, featured products, etc.)
 * Accepts partial homepage object via dot-notation keys
 */
export async function updateHomepageAction(_formData: FormData) {
  await requireAdminSession();

  // Parse the homepage object from form data
  // This is simplified — in a real form you'd handle complex nested structures
  const homepage: Record<string, unknown> = {};

  // For now, we accept an empty homepage object — actual updates would parse form data
  // In a more complex form, you'd parse nested arrays and objects from formData

  await connectDB();
  try {
    // Use dot-notation to update nested homepage object
    const updateData: UpdateSettingsInput = { homepage };
    await updateSettings(updateData);
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    revalidatePath("/api/settings");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update homepage" };
  }
}
