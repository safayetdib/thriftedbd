"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/customer.schema";
import Customer from "@/models/Customer";

async function requireCustomerSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "customer") {
    throw new Error("UNAUTHORIZED");
  }
  return session.user.id;
}

/**
 * Update customer profile (name, phone).
 * Only name and phone can be updated; email changes are not supported.
 */
export async function updateProfileAction(
  _prevState: { error: string } | undefined,
  formData: FormData,
) {
  const customerId = await requireCustomerSession();

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  const parsed = updateProfileSchema.safeParse({ name, phone });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDB();
  try {
    await Customer.findByIdAndUpdate(customerId, parsed.data, { new: true });
    revalidatePath("/account/profile");
    return { error: "" }; // Clear error on success
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update profile" };
  }
}
