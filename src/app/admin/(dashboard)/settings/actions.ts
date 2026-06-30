"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { updateSettingsSchema } from "@/lib/validations/settings.schema";
import { updateSettings } from "@/lib/services/settings.service";

export async function updateSettingsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }

  const raw = Object.fromEntries(formData.entries());
  const input = {
    deliveryFee: {
      insideDhaka: Number(raw.insideDhaka),
      outsideDhaka: Number(raw.outsideDhaka),
    },
    storeContact: {
      phone: String(raw.storeContactPhone ?? ""),
      email: String(raw.storeContactEmail ?? ""),
      address: String(raw.storeContactAddress ?? ""),
    },
    socialLinks: {
      facebook: raw.facebook || undefined,
      instagram: raw.instagram || undefined,
      tiktok: raw.tiktok || undefined,
      youtube: raw.youtube || undefined,
    },
    announcement: { en: raw.announcementEn || undefined, bn: raw.announcementBn || undefined },
    riskThresholds: { largeOrderAmount: Number(raw.largeOrderAmount) },
  };

  const parsed = updateSettingsSchema.safeParse(input);
  if (!parsed.success) {
    redirect(
      `/admin/settings?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`,
    );
  }

  await connectDB();
  await updateSettings(parsed.data);
  revalidatePath("/admin/settings");
  revalidatePath("/api/settings");
}
