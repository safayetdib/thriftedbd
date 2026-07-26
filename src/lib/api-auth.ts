import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Returns a 401/403 response if the caller isn't an authenticated admin (either
 * "admin" or "superadmin"), otherwise null.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }
  if (session.user.role !== "admin" && session.user.role !== "superadmin") {
    return NextResponse.json(
      { error: { message: "Forbidden", code: "FORBIDDEN" } },
      { status: 403 },
    );
  }
  return null;
}

/**
 * Returns a 401/403 response unless the caller is a "superadmin". Used to gate
 * admin-user management (creating/deleting admins, resetting their passwords).
 */
export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }
  if (session.user.role !== "superadmin") {
    return NextResponse.json(
      { error: { message: "Forbidden — superadmin only", code: "FORBIDDEN" } },
      { status: 403 },
    );
  }
  return null;
}

/** Returns a 401/403 response if the caller isn't an authenticated customer, otherwise null. */
export async function requireCustomer() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }
  if (session.user.role !== "customer") {
    return NextResponse.json(
      { error: { message: "Forbidden", code: "FORBIDDEN" } },
      { status: 403 },
    );
  }
  return null;
}
