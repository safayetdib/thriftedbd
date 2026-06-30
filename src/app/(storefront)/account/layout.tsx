import { redirect } from "next/navigation";
import Link from "next/link";
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
  const session = await auth();

  if (!session?.user || session.user.role !== "customer") {
    redirect("/login?callbackUrl=/account/orders");
  }

  const navItems = [
    { href: "/account/orders", label: "Orders", icon: PackageIcon },
    { href: "/account/profile", label: "Profile", icon: UserCircleIcon },
    { href: "/account/coupons", label: "Coupons", icon: TicketIcon },
  ];

  return (
    <div className="flex min-h-screen gap-0">
      {/* Sidebar */}
      <nav className="border-ink-900 flex w-60 shrink-0 flex-col border-r-2 bg-white">
        <div className="border-ink-900 border-b-2 px-5 py-5">
          <p className="text-eyebrow text-green-700">thriftedBD</p>
          <p className="text-ink-900 text-lg font-extrabold">My Account</p>
        </div>

        <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-ink-700 hover:border-ink-900 hover:bg-ink-100 flex items-center gap-2.5 border-2 border-transparent px-3 py-2 text-sm font-semibold transition-colors"
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-ink-900 border-t-2 p-3">
          <LogoutForm>
            <Button variant="secondary" size="sm" className="w-full justify-start">
              <SignOutIcon size={18} /> Sign out
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
