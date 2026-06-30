"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createCouponSchema, updateCouponSchema } from "@/lib/validations/coupon.schema";
import { createCoupon, updateCoupon, deleteCoupon } from "@/lib/services/coupon.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
}

export async function createCouponAction(input: unknown) {
  await requireAdminSession();
  const parsed = createCouponSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await createCoupon(parsed.data);
    revalidatePath("/admin/coupons");
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) {
      return { error: "Coupon code already exists" };
    }
    return { error: err instanceof Error ? err.message : "Failed to create coupon" };
  }
}

export async function updateCouponAction(id: string, input: unknown) {
  await requireAdminSession();
  const parsed = updateCouponSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  try {
    await updateCoupon(id, parsed.data);
    revalidatePath("/admin/coupons");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update coupon" };
  }
}

export async function deleteCouponAction(id: string) {
  await requireAdminSession();
  await connectDB();
  await deleteCoupon(id);
  revalidatePath("/admin/coupons");
}
