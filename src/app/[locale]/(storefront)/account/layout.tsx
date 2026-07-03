import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  SignOutIcon,
  PackageIcon,
  UserCircleIcon,
  TicketIcon,
} from "@phosphor-icons/react/dist/ssr";
import { LogoutForm } from "@/components/auth/logout-form";

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

  return (
    <div className="flex min-h-screen gap-0">
      {/* Sidebar */}
      <nav className="border-ink-900 flex w-60 shrink-0 flex-col border-r bg-white">
        <div className="border-ink-900 border-b px-6 py-5">
          <p className="text-eyebrow text-caption font-bold tracking-widest text-green-700 uppercase">
            thriftedBD
          </p>
          <p className="text-ink-900 text-body-md font-extrabold">{t("myAccount")}</p>
        </div>

        <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-ink-700 hover:bg-ink-100 text-body-sm flex items-center gap-2.5 rounded-md px-3 py-2 font-semibold transition-colors"
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-ink-900 border-t p-3">
          <LogoutForm>
            <Button variant="secondary" size="sm" className="w-full justify-start">
              <SignOutIcon size={18} /> {t("signOut")}
            </Button>
          </LogoutForm>
        </div>
      </nav>

      {/* Main content */}
      <main className="bg-ink-50 flex flex-1 flex-col gap-6 px-6 py-6">
        <div className="max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
