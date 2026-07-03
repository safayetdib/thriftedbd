"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFourIcon,
  PackageIcon,
  TagIcon,
  FolderSimpleIcon,
  PaletteIcon,
  UserCircleIcon,
  UsersIcon,
  ProhibitIcon,
  CurrencyDollarIcon,
  GearIcon,
  ShieldCheckIcon,
  BookmarkIcon,
  SpeakerSimpleXIcon,
  TicketIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: SquaresFourIcon, exact: true },
  { href: "/admin/orders", label: "Orders", icon: PackageIcon },
  { href: "/admin/products", label: "Products", icon: TagIcon },
  { href: "/admin/categories", label: "Categories", icon: FolderSimpleIcon },
  { href: "/admin/colors", label: "Colors", icon: PaletteIcon },
  { href: "/admin/owners", label: "Owners", icon: UserCircleIcon },
  { href: "/admin/customers", label: "Customers", icon: UsersIcon },
  { href: "/admin/homepage", label: "Homepage", icon: BookmarkIcon },
  { href: "/admin/promotions", label: "Promotions", icon: SpeakerSimpleXIcon },
  { href: "/admin/coupons", label: "Coupons", icon: TicketIcon },
  { href: "/admin/blacklist", label: "Blacklist", icon: ProhibitIcon },
  { href: "/admin/transactions", label: "Transactions", icon: CurrencyDollarIcon },
  { href: "/admin/settings", label: "Settings", icon: GearIcon },
  { href: "/admin/users", label: "Admin users", icon: ShieldCheckIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="border-ink-900 flex h-full w-60 shrink-0 flex-col border-r bg-white">
      <div className="border-ink-900 border-b px-5 py-4">
        <p className="text-eyebrow text-caption font-bold tracking-widest text-green-700 uppercase">
          thriftedBD
        </p>
        <p className="text-ink-900 text-body-md font-extrabold">Admin</p>
      </div>
      <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "text-body-sm flex items-center gap-2.5 rounded-md px-3 py-2 font-semibold transition-colors",
                  isActive ? "text-ink-900 bg-green-500" : "text-ink-700 hover:bg-ink-100",
                )}
              >
                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
