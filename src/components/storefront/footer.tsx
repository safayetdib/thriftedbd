"use client";

import { Link } from "@/i18n/navigation";
import { SOCIAL_DEFAULTS, type SocialLinks } from "@/lib/social-links";
import {
  FacebookLogoIcon,
  InstagramLogoIcon,
  TiktokLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

type Department = { slug: string; name: string };

export function SiteFooter({
  socialLinks,
  departments,
}: {
  socialLinks?: SocialLinks;
  departments?: Department[];
}) {
  const t = useTranslations("footer");

  return (
    // DESIGN.md → Components → footer: canvas background, mute text, caption-md,
    // separated from the page by a single hairline. Nike never inverts the footer.
    <footer className="border-hairline text-mute mt-auto border-t bg-white">
      {/* Main footer grid */}
      <div className="max-w-container mx-auto px-4 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Shop */}
          <div>
            <h3 className="text-ink-900 text-heading-md mb-4">{t("shop")}</h3>
            <ul className="space-y-2">
              {departments?.map((dept) => (
                <li key={dept.slug}>
                  <Link
                    href={`/products?category=${dept.slug}`}
                    className="text-mute hover:text-ink-900 text-caption-md transition-colors"
                  >
                    {dept.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products"
                  className="text-mute hover:text-ink-900 text-caption-md transition-colors"
                >
                  {t("allProducts")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Help */}
          <div>
            <h3 className="text-ink-900 text-heading-md mb-4">{t("help")}</h3>
            <ul className="space-y-2">
              {[
                { label: t("trackMyOrder"), href: "/track-order" },
                { label: t("returnPolicy"), href: "/returns" },
                { label: t("faq"), href: "/#faq" },
                { label: t("contactUs"), href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-mute hover:text-ink-900 text-caption-md transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Newsletter */}
          <div>
            <h3 className="text-ink-900 text-heading-md mb-4">{t("stayUpdated")}</h3>
            <p className="text-mute text-caption-md mb-3">{t("newsletterBlurb")}</p>
            <NewsletterForm />
          </div>

          {/* Col 4: Connect + Trust */}
          <div>
            <h3 className="text-ink-900 text-heading-md mb-4">{t("connect")}</h3>
            <div className="mb-6 flex gap-3">
              {(
                [
                  ["Facebook", socialLinks?.facebook || SOCIAL_DEFAULTS.facebook, FacebookLogoIcon],
                  [
                    "Instagram",
                    socialLinks?.instagram || SOCIAL_DEFAULTS.instagram,
                    InstagramLogoIcon,
                  ],
                  ["TikTok", socialLinks?.tiktok || SOCIAL_DEFAULTS.tiktok, TiktokLogoIcon],
                  ["YouTube", socialLinks?.youtube || SOCIAL_DEFAULTS.youtube, YoutubeLogoIcon],
                ] as const
              ).map(([label, href, Icon]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="bg-soft-cloud text-ink-900 hover:bg-ink-900 flex size-10 items-center justify-center rounded-full transition-colors hover:text-white"
                >
                  <Icon size={20} weight="fill" />
                </a>
              ))}
            </div>

            {/* Trust badges */}
            <div className="space-y-2">
              {[t("badgeCod"), t("badgePayment"), t("badgeQuality"), t("badgeDelivery")].map(
                (badge) => (
                  <p key={badge} className="text-mute text-caption-sm">
                    ✓ {badge}
                  </p>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      {/* Legal fine-print row - Nike's lowest utility tier. */}
      <div className="border-hairline-soft border-t px-4 py-5 md:px-8">
        <div className="max-w-container mx-auto flex flex-col items-center justify-between gap-3 sm:flex-row">
          {/* Brand lockup - mirrors the header: "t" icon + live-text wordmark. */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/icons/icon.png" alt="" width={32} height={32} className="rounded-[6px]" />
            <span className="text-ink-900 text-heading-lg tracking-tight">
              thrifted<span className="font-normal">BD</span>
            </span>
          </Link>
          <div className="flex flex-col items-center gap-1 sm:items-end">
            <p className="text-stone text-caption-sm">
              {t("rights", { year: new Date().getFullYear() })} · {t("tagline")}
            </p>
            <p className="text-stone text-caption-sm">
              {t("developedBy")}{" "}
              <a
                href="https://safayetadib.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mute hover:text-ink-900 underline underline-offset-2 transition-colors"
              >
                Safayet
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const t = useTranslations("footer");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    // Genuine success semantics - one of the few places colour is earned.
    return <p className="text-caption-md text-success">{t("subscribed")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 pr-14">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        required
        className="bg-soft-cloud text-ink-900 placeholder:text-mute focus:border-ink-900 text-caption-md rounded-pill min-w-0 flex-1 border border-transparent px-4 py-2.5 outline-none focus:bg-white"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-ink-900 hover:bg-ink-800 text-caption-md rounded-pill shrink-0 px-5 py-2.5 text-white transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "…" : t("go")}
      </button>
    </form>
  );
}
