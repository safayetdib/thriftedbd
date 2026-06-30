"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/customer.schema";
import { updateCustomerProfile } from "@/lib/services/customer.service";

export async function updateCustomerAction(customerId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    redirect(
      `/admin/customers/${customerId}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`,
    );
  }

  await connectDB();
  await updateCustomerProfile(customerId, parsed.data);
  revalidatePath(`/admin/customers/${customerId}`);
}
