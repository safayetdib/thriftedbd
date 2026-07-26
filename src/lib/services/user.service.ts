import bcrypt from "bcryptjs";
import User from "@/models/User";
import type { CreateUserInput } from "@/lib/validations/user.schema";

export async function getUsers() {
  return User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
}

export async function createUser(input: CreateUserInput) {
  const existing = await User.findOne({ email: input.email.toLowerCase() }).lean();
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    role: input.role ?? "admin",
  });
  return { _id: user._id, email: user.email, role: user.role, createdAt: user.createdAt };
}

/**
 * Hard-deletes an admin user. Guards against removing the final superadmin so
 * the panel can never be locked out of user management.
 */
export async function deleteUser(id: string) {
  const user = await User.findById(id);
  if (!user) throw new Error("USER_NOT_FOUND");

  if (user.role === "superadmin") {
    const superadminCount = await User.countDocuments({ role: "superadmin" });
    if (superadminCount <= 1) throw new Error("LAST_SUPERADMIN");
  }

  await user.deleteOne();
  return { _id: user._id };
}

export async function updateUserPassword(id: string, password: string) {
  const user = await User.findById(id);
  if (!user) throw new Error("USER_NOT_FOUND");

  user.passwordHash = await bcrypt.hash(password, 12);
  await user.save();
  return { _id: user._id, email: user.email, role: user.role, createdAt: user.createdAt };
}
