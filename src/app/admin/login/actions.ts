"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function adminLoginAction(_prevState: string | undefined, formData: FormData) {
  // Throttle brute-force against the admin panel: 5 attempts per IP per 15 min.
  const ip = getClientIp(await headers());
  const rl = rateLimit(`login:admin:${ip}`, 5, 15 * 60_000);
  if (!rl.ok) {
    return `Too many login attempts. Please try again in ${rl.retryAfterSeconds}s.`;
  }

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
