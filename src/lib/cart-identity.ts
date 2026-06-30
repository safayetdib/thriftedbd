import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import type { CartIdentity } from "@/lib/services/cart.service";

const CART_TOKEN_COOKIE = "cartToken";

/** Resolves the caller's cart identity, issuing a guest cartToken cookie if needed. */
export async function resolveCartIdentity(): Promise<CartIdentity> {
  const session = await auth();
  if (session?.user?.role === "customer") {
    return { customerId: session.user.id };
  }

  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CART_TOKEN_COOKIE)?.value;
  if (existingToken) {
    return { cartToken: existingToken };
  }

  const token = randomUUID();
  cookieStore.set(CART_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return { cartToken: token };
}

/**
 * Read-only counterpart for Server Components (layouts/pages) — Next.js
 * only allows cookies().set() in a Server Action or Route Handler, never
 * during render. Returns undefined if no identity exists yet (guest with
 * no cartToken cookie); the cookie itself only gets created lazily by the
 * cart API routes on first real interaction.
 */
export async function peekCartIdentity(): Promise<CartIdentity | undefined> {
  const session = await auth();
  if (session?.user?.role === "customer") {
    return { customerId: session.user.id };
  }

  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CART_TOKEN_COOKIE)?.value;
  return existingToken ? { cartToken: existingToken } : undefined;
}
