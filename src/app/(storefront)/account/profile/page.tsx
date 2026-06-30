import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import { ProfileForm } from "./profile-form";

/**
 * Customer profile page.
 * Shows: email (read-only), name, phone
 * Allows editing name and phone.
 */
export default async function AccountProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const customer = await Customer.findById(session.user.id).lean();
  if (!customer) return null;

  return <ProfileForm customer={customer} />;
}
