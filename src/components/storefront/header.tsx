"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  ListIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  ShoppingBagIcon,
  XIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

type SubCategory = { slug: string; name: string; coverImage?: { url: string; key: string } };
type Department = {
  slug: string;
  name: string;
  coverImage?: { url: string; key: string };
  children: SubCategory[];
};

export function SiteHeader({
  departments,
  cartCount,
}: {
  departments: Department[];
  cartCount: number;
}) {
  const t = useTranslations("header");

  return (
    <header className="border-ink-900 sticky top-0 z-40 border-b-2 bg-white">
      <div className="max-w-container mx-auto flex h-16 w-full items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="text-ink-900 shrink-0 text-lg font-extrabold tracking-tight">
          thrifted<span className="text-green-600">BD</span>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden items-center gap-0 lg:flex">
          {departments.slice(0, 7).map((dept) => (
            <div key={dept.slug} className="group relative">
              {/* Department link */}
              <Link
                href={`/products?category=${dept.slug}`}
                className="text-ink-700 hover:text-ink-900 group-hover:text-ink-900 relative flex h-16 items-center px-4 text-sm font-semibold transition-colors"
              >
                {dept.name}
                {/* Active underline on hover */}
                <span className="bg-ink-900 absolute right-4 bottom-0 left-4 h-0.5 scale-x-0 transition-transform group-hover:scale-x-100" />
              </Link>

              {/* Mega menu dropdown — only if subcategories exist */}
              {dept.children.length > 0 && (
                <div className="border-ink-900 pointer-events-none absolute top-full left-1/2 min-w-[480px] -translate-x-1/2 border-2 bg-white opacity-0 shadow-lg transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
                  <div className="p-4">
                    <p className="text-eyebrow text-ink-500 mb-3 text-xs font-bold tracking-widest uppercase">
                      {dept.name}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {dept.children.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/products?category=${sub.slug}`}
                          className="group/sub border-ink-200 hover:border-ink-900 flex flex-col gap-2 border-2 p-2 transition-colors"
                        >
                          {/* Cover image */}
                          <div className="bg-ink-100 relative aspect-square w-full overflow-hidden">
                            {sub.coverImage ? (
                              <Image
                                src={sub.coverImage.url}
                                alt={sub.name}
                                fill
                                sizes="120px"
                                className="object-cover transition-transform duration-200 group-hover/sub:scale-[1.04]"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <span className="text-ink-300 text-xs">{t("noImage")}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-ink-900 text-center text-xs font-semibold">
                            {sub.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                    {/* View all link */}
                    <Link
                      href={`/products?category=${dept.slug}`}
                      className="mt-3 block text-center text-xs font-semibold text-green-700 hover:underline"
                    >
                      {t("viewAll", { name: dept.name })} →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile hamburger + right icons */}
        <div className="flex items-center gap-1">
          {/* Mobile menu trigger */}
          <MobileMenu departments={departments} />

          {/* Desktop-only icons */}
          <div className="hidden items-center gap-1 lg:flex">
            <Link href="/products" aria-label={t("search")}>
              <Button variant="ghost" size="icon-sm">
                <MagnifyingGlassIcon size={20} />
              </Button>
            </Link>
            <Link href="/account" aria-label={t("account")}>
              <Button variant="ghost" size="icon-sm">
                <UserIcon size={20} />
              </Button>
            </Link>
            <Link href="/favorites" aria-label={t("wishlist")}>
              <Button variant="ghost" size="icon-sm">
                <HeartIcon size={20} />
              </Button>
            </Link>
          </div>

          {/* Cart — always visible */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon-sm" aria-label={t("cart")}>
              <ShoppingBagIcon size={20} />
            </Button>
            {cartCount > 0 && (
              <span className="border-ink-900 absolute -top-1 -right-1 flex size-5 items-center justify-center border-2 bg-green-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Language toggle — a real route change per docs/i18n-guidelines.md */}
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const otherLocale = locale === "en" ? "bn" : "en";
  const query = searchParams.toString();
  const href = query ? `${pathname}?${query}` : pathname;

  return (
    <Link
      href={href}
      locale={otherLocale}
      className="border-ink-900 text-ink-900 hover:bg-ink-900 ml-1 flex h-8 items-center border-2 px-2 text-xs font-bold transition-colors hover:text-white"
      aria-label={locale === "en" ? "বাংলায় দেখুন" : "View in English"}
    >
      {locale === "en" ? "বাং" : "EN"}
    </Link>
  );
}

function MobileMenu({ departments }: { departments: Department[] }) {
  const t = useTranslations("header");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        aria-label={t("openMenu")}
        onClick={() => setOpen(true)}
      >
        <ListIcon size={22} />
      </Button>

      {/* Overlay */}
      {open && <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} />}

      {/* Slide-in panel */}
      <div
        className={`border-ink-900 fixed top-0 left-0 z-50 flex h-full w-80 max-w-[90vw] flex-col border-r-2 bg-white transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-ink-900 flex h-16 items-center justify-between border-b-2 px-4">
          <span className="text-ink-900 font-extrabold">{t("menu")}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
            aria-label={t("close")}
          >
            <XIcon size={20} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {departments.map((dept) => (
            <div key={dept.slug} className="border-ink-200 border-b">
              <div className="flex items-center justify-between">
                <Link
                  href={`/products?category=${dept.slug}`}
                  onClick={() => setOpen(false)}
                  className="text-ink-900 flex-1 py-3 text-sm font-semibold"
                >
                  {dept.name}
                </Link>
                {dept.children.length > 0 && (
                  <button
                    onClick={() => setExpanded(expanded === dept.slug ? null : dept.slug)}
                    className="text-ink-500 hover:text-ink-900 px-2 py-3"
                    aria-label={t("expand")}
                  >
                    <CaretDownIcon
                      size={16}
                      className={`transition-transform ${
                        expanded === dept.slug ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {expanded === dept.slug && dept.children.length > 0 && (
                <div className="bg-ink-50 pb-2 pl-4">
                  {dept.children.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/products?category=${sub.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-ink-700 hover:text-ink-900 flex items-center gap-2 py-2 text-sm"
                    >
                      {sub.coverImage && (
                        <div className="relative size-8 shrink-0 overflow-hidden">
                          <Image
                            src={sub.coverImage.url}
                            alt={sub.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Extra links */}
          <div className="mt-4 flex flex-col gap-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="text-ink-700 py-2 text-sm font-semibold"
            >
              {t("myAccount")}
            </Link>
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="text-ink-700 py-2 text-sm font-semibold"
            >
              {t("favorites")}
            </Link>
            <Link
              href="/track-order"
              onClick={() => setOpen(false)}
              className="text-ink-700 py-2 text-sm font-semibold"
            >
              {t("trackOrder")}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
