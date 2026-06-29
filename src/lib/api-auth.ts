import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/** Returns a 401/403 response if the caller isn't an authenticated admin, otherwise null. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: { message: "Forbidden", code: "FORBIDDEN" } },
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
