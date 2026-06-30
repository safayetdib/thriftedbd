"use client";

import Link from "next/link";
import {
  ListIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  ShoppingBagIcon,
} from "@phosphor-icons/react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type NavCategory = { slug: string; name: string };

export function SiteHeader({
  categories,
  cartCount,
}: {
  categories: NavCategory[];
  cartCount: number;
}) {
  return (
    <header className="border-ink-900 sticky top-0 z-40 flex h-16 items-center border-b-2 bg-white px-4 md:px-8">
      <div className="max-w-container mx-auto flex w-full items-center justify-between">
        <div className="flex items-center gap-6">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <ListIcon size={22} />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products?category=${c.slug}`}
                    className="text-ink-900 hover:bg-ink-100 px-2 py-2.5 text-sm font-semibold"
                  >
                    {c.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="text-ink-900 text-lg font-extrabold tracking-tight">
            thrifted<span className="text-green-600">BD</span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                className="text-ink-700 hover:text-ink-900 text-sm font-semibold"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Search">
            <MagnifyingGlassIcon size={20} />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Account">
            <UserIcon size={20} />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Wishlist">
            <HeartIcon size={20} />
          </Button>
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon-sm" aria-label="Cart">
              <ShoppingBagIcon size={20} />
            </Button>
            {cartCount > 0 && (
              <span className="border-ink-900 absolute -top-1 -right-1 flex size-5 items-center justify-center border-2 bg-green-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
