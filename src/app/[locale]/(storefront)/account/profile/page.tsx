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

  // Pass only the plain fields the form needs - a lean() doc still carries
  // ObjectId/Date instances (not serializable across the RSC boundary) and
  // the passwordHash, which must never reach the client payload.
  return (
    <ProfileForm customer={{ email: customer.email, name: customer.name, phone: customer.phone }} />
  );
}
