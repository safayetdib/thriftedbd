"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ListIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  ShoppingBagIcon,
  XIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
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
    // Nike's primary nav: white, hairline bottom edge, no shadow.
    <header className="border-hairline-soft sticky top-0 z-40 border-b bg-white">
      <div className="max-w-container mx-auto flex h-16 w-full items-center justify-between px-6 md:px-8">
        {/* Brand lockup — the "t" icon paired with the ink wordmark. The icon
            carries the only brand colour; the wordmark stays ink. Live text is
            kept (not the logo image) so it stays crisp and indexable. */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/icons/icon.png"
            alt=""
            width={32}
            height={32}
            className="rounded-[6px]"
            priority
          />
          <span className="text-ink-900 text-heading-lg tracking-tight">
            thrifted<span className="font-normal">BD</span>
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden items-center gap-0 lg:flex">
          {departments.slice(0, 7).map((dept) => (
            <div key={dept.slug} className="group relative">
              {/* Department link */}
              <Link
                href={`/products?category=${dept.slug}`}
                className="text-ink-700 hover:text-ink-900 group-hover:text-ink-900 text-body-sm-strong relative flex h-16 items-center px-4 transition-colors"
              >
                {dept.name}
                {/* Active underline on hover */}
                <span className="bg-ink-900 absolute right-4 bottom-0 left-4 h-0.5 scale-x-0 transition-transform group-hover:scale-x-100" />
              </Link>

              {/* Mega menu dropdown — only if subcategories exist */}
              {dept.children.length > 0 && (
                <div className="border-hairline-soft pointer-events-none absolute top-full left-1/2 min-w-[480px] -translate-x-1/2 rounded-none border bg-white opacity-0 shadow-md transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
                  <div className="p-6">
                    <p className="text-eyebrow text-mute text-caption-sm mb-3">{dept.name}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {dept.children.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/products?category=${sub.slug}`}
                          className="group/sub flex flex-col gap-2 rounded-none"
                        >
                          {/* Cover image — soft cloud stage, zero radius. */}
                          <div className="bg-soft-cloud relative aspect-square w-full overflow-hidden rounded-none">
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
                                <span className="text-stone text-caption-sm">{t("noImage")}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-ink-900 text-caption-md text-center group-hover/sub:underline">
                            {sub.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                    {/* View all link */}
                    <Link
                      href={`/products?category=${dept.slug}`}
                      className="text-link-md text-ink-900 mt-4 block text-center"
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
              <span className="bg-ink-900 text-caption-sm absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
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
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          role="presentation"
          aria-hidden={true}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`border-hairline fixed top-0 left-0 z-50 flex h-full w-80 max-w-[90vw] flex-col border-r bg-white transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <div className="border-hairline-soft flex h-16 items-center justify-between border-b px-6">
          <span className="text-ink-900 text-body-md-strong">{t("menu")}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
            aria-label={t("close")}
          >
            <XIcon size={20} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-4">
          {departments.map((dept) => (
            <div key={dept.slug} className="border-hairline-soft border-b">
              <div className="flex items-center justify-between">
                <Link
                  href={`/products?category=${dept.slug}`}
                  onClick={() => setOpen(false)}
                  className="text-ink-900 text-body-sm-strong flex-1 py-3"
                >
                  {dept.name}
                </Link>
                {dept.children.length > 0 && (
                  <button
                    onClick={() => setExpanded(expanded === dept.slug ? null : dept.slug)}
                    className="text-mute hover:text-ink-900 px-2 py-3"
                    aria-label={t("expand")}
                    aria-expanded={expanded === dept.slug}
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
                <div className="pb-2 pl-4">
                  {dept.children.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/products?category=${sub.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-ink-700 hover:text-ink-900 text-body-sm flex items-center gap-2 py-2"
                    >
                      {sub.coverImage && (
                        <div className="bg-soft-cloud relative size-8 shrink-0 overflow-hidden rounded-none">
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
              className="text-ink-700 text-body-sm-strong py-2"
            >
              {t("myAccount")}
            </Link>
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="text-ink-700 text-body-sm-strong py-2"
            >
              {t("favorites")}
            </Link>
            <Link
              href="/track-order"
              onClick={() => setOpen(false)}
              className="text-ink-700 text-body-sm-strong py-2"
            >
              {t("trackOrder")}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
