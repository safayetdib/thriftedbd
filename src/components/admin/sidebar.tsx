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
  ImagesIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: SquaresFourIcon, exact: true },
  { href: "/admin/orders", label: "Orders", icon: PackageIcon },
  { href: "/admin/products", label: "Products", icon: TagIcon },
  { href: "/admin/media", label: "Media", icon: ImagesIcon },
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
    <nav className="border-hairline flex h-full w-60 shrink-0 flex-col border-r bg-white">
      <div className="border-hairline border-b px-5 py-4">
        <p className="text-eyebrow text-caption-sm text-mute">thriftedBD</p>
        <p className="text-ink-900 text-heading-md">Admin</p>
      </div>
      {/* Active nav is a solid ink block — black is the only "brand colour". */}
      <ul className="flex flex-1 flex-col overflow-y-auto py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "text-body-sm-strong flex items-center gap-2.5 rounded-none px-5 py-2.5 transition-colors",
                  isActive
                    ? "bg-ink-900 text-white hover:text-white"
                    : "text-charcoal hover:bg-soft-cloud hover:text-ink-900",
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
