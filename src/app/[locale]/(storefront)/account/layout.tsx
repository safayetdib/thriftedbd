import { LogoutForm } from "@/components/auth/logout-form";
import { Button } from "@/components/ui/button";
import { Link, redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import {
  PackageIcon,
  SignOutIcon,
  TicketIcon,
  UserCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { getLocale, getTranslations } from "next-intl/server";
import { AccountNav, type AccountNavItem } from "./account-nav";

/**
 * Account layout: protected route for authenticated customers.
 * - Server-side auth check: redirects unauthenticated users to /login
 * - Side navigation: Orders, Profile, Coupons
 * - Logout button
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("account");
  const locale = await getLocale();
  const session = await auth();

  if (!session?.user || session.user.role !== "customer") {
    redirect({ href: "/login?callbackUrl=/account/orders", locale });
  }

  const navItems = [
    { href: "/account/orders", label: t("orders"), icon: PackageIcon },
    { href: "/account/profile", label: t("profile"), icon: UserCircleIcon },
    { href: "/account/coupons", label: t("coupons"), icon: TicketIcon },
  ];

  const mobileNavItems: AccountNavItem[] = [
    { href: "/account/orders", label: t("orders"), icon: "orders" },
    { href: "/account/profile", label: t("profile"), icon: "profile" },
    { href: "/account/coupons", label: t("coupons"), icon: "coupons" },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile nav - pill tabs + compact sign-out; replaced by the sidebar at md. */}
      <div className="border-hairline flex items-center gap-2 border-b bg-white px-4 py-3 md:hidden">
        <AccountNav items={mobileNavItems} />
        <LogoutForm>
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            aria-label={t("signOut")}
          >
            <SignOutIcon size={18} />
          </Button>
        </LogoutForm>
      </div>

      {/* Sidebar */}
      <nav className="border-hairline hidden w-60 shrink-0 flex-col border-r bg-white md:flex">
        <div className="border-hairline border-b px-6 py-5">
          <p className="text-eyebrow text-caption-sm text-ink-900">thriftedBD</p>
          <p className="text-ink-900 text-body-strong">{t("myAccount")}</p>
        </div>

        <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                prefetch={false}
                className="text-charcoal hover:bg-soft-cloud text-caption-md rounded-pill flex items-center gap-2.5 px-3 py-2 transition-colors"
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-hairline border-t p-3">
          <LogoutForm>
            <Button type="submit" variant="secondary" size="sm" className="w-full justify-start">
              <SignOutIcon size={18} /> {t("signOut")}
            </Button>
          </LogoutForm>
        </div>
      </nav>

      {/* Main content */}
      <main className="bg-soft-cloud flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
        <div className="max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
