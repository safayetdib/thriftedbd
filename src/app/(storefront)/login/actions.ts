"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

/**
 * Customer login action.
 * Calls signIn with "customer" provider.
 * On success: redirects to /account/orders (or callbackUrl if provided)
 * On error: returns error message to form
 */
export async function customerLoginAction(_prevState: string | undefined, formData: FormData) {
  const callbackUrl = formData.get("callbackUrl") as string | null;

  try {
    await signIn("customer", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: callbackUrl || "/account/orders",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password";
    }
    throw error;
  }
}
