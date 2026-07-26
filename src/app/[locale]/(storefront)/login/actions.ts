"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Customer login action.
 * Calls signIn with "customer" provider.
 * On success: redirects to /account/orders (or callbackUrl if provided)
 * On error: returns error message to form
 */
export async function customerLoginAction(_prevState: string | undefined, formData: FormData) {
  const callbackUrl = formData.get("callbackUrl") as string | null;

  // Throttle credential-stuffing: 5 attempts per IP per 15 minutes.
  const ip = getClientIp(await headers());
  const rl = rateLimit(`login:customer:${ip}`, 5, 15 * 60_000);
  if (!rl.ok) {
    return `Too many login attempts. Please try again in ${rl.retryAfterSeconds}s.`;
  }

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
