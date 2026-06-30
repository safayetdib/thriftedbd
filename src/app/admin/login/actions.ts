"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function adminLoginAction(_prevState: string | undefined, formData: FormData) {
  try {
    await signIn("admin", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password";
    }
    throw error;
  }
}
