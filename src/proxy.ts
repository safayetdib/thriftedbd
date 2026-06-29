import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const isAccountRoute = pathname.startsWith("/account") && pathname !== "/login";
  if (isAccountRoute && role !== "customer") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
