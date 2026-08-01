"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { PackageIcon, TicketIcon, UserCircleIcon } from "@phosphor-icons/react";

const ICONS = {
  orders: PackageIcon,
  profile: UserCircleIcon,
  coupons: TicketIcon,
} as const;

export type AccountNavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
};

/**
 * Mobile account navigation - horizontal pill tabs shown under md, replacing
 * the desktop sidebar. Client component only because the active state needs
 * the current pathname.
 */
export function AccountNav({ items }: { items: AccountNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
      {items.map(({ href, label, icon }) => {
        const Icon = ICONS[icon];
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className={cn(
              "rounded-pill text-caption-md flex shrink-0 items-center gap-1.5 px-4 py-2 whitespace-nowrap transition-colors",
              active ? "bg-ink-900 text-white" : "bg-soft-cloud text-charcoal hover:text-ink-900",
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
