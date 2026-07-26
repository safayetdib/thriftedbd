"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { signupSchema } from "@/lib/validations/customer.schema";
import { createCustomer } from "@/lib/services/customer.service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Customer signup action.
 * 1. Validates input with signupSchema
 * 2. Creates customer in database
 * 3. Auto-signs in via signIn("customer", ...)
 * 4. Redirects to /account/orders on success
 * On error: returns error message
 */
export async function customerSignupAction(_prevState: string | undefined, formData: FormData) {
  // Throttle mass account creation: 5 signups per IP per hour.
  const ip = getClientIp(await headers());
  const rl = rateLimit(`signup:${ip}`, 5, 60 * 60_000);
  if (!rl.ok) {
    return `Too many attempts. Please try again in ${rl.retryAfterSeconds}s.`;
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  // Validate input
  const parsed = signupSchema.safeParse({ email, password, name, phone });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid input";
  }

  // Create customer
  await connectDB();
  try {
    await createCustomer(parsed.data);
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return "Email is already registered";
    }
    return err instanceof Error ? err.message : "Failed to create account";
  }

  // Auto-sign in
  try {
    await signIn("customer", {
      email,
      password,
      redirectTo: "/account/orders",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Account created but sign in failed — please sign in manually";
    }
    throw error;
  }
}
