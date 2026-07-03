import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";

const intl = createIntlMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  // Admin is never localized — auth-gate it and skip the intl handling.
  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login" && role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // Customer-only routes: check against the locale-stripped path so
  // /bn/account is gated the same as /account.
  const bnPrefixed = pathname === "/bn" || pathname.startsWith("/bn/");
  const path = bnPrefixed ? pathname.slice(3) || "/" : pathname;
  const isCustomerRoute =
    (path.startsWith("/account") && path !== "/login") || path === "/favorites";
  if (isCustomerRoute && role !== "customer") {
    const callbackUrl = encodeURIComponent(pathname + req.nextUrl.search);
    const loginPath = bnPrefixed ? "/bn/login" : "/login";
    return NextResponse.redirect(new URL(`${loginPath}?callbackUrl=${callbackUrl}`, req.url));
  }

  // Everything else on the storefront goes through next-intl: locale
  // detection, the /bn rewrite, and the NEXT_LOCALE cookie.
  return intl(req);
});

export const config = {
  // Run on all pages, but never on API routes, Next internals, or files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
