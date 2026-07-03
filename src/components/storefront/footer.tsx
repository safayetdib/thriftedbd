"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type SocialLinks = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
};

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
    <footer className="bg-ink-900 text-ink-100 border-ink-900 mt-auto border-t-2">
      {/* Main footer grid */}
      <div className="max-w-container mx-auto px-4 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Shop */}
          <div>
            <h3 className="text-ink-50 mb-4 text-sm font-extrabold tracking-widest uppercase">
              {t("shop")}
            </h3>
            <ul className="space-y-2">
              {departments?.map((dept) => (
                <li key={dept.slug}>
                  <Link
                    href={`/products?category=${dept.slug}`}
                    className="text-ink-400 hover:text-ink-50 text-sm transition-colors"
                  >
                    {dept.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products"
                  className="text-ink-400 hover:text-ink-50 text-sm transition-colors"
                >
                  {t("allProducts")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Help */}
          <div>
            <h3 className="text-ink-50 mb-4 text-sm font-extrabold tracking-widest uppercase">
              {t("help")}
            </h3>
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
                    className="text-ink-400 hover:text-ink-50 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Newsletter */}
          <div>
            <h3 className="text-ink-50 mb-4 text-sm font-extrabold tracking-widest uppercase">
              {t("stayUpdated")}
            </h3>
            <p className="text-ink-400 mb-3 text-sm">{t("newsletterBlurb")}</p>
            <NewsletterForm />
          </div>

          {/* Col 4: Connect + Trust */}
          <div>
            <h3 className="text-ink-50 mb-4 text-sm font-extrabold tracking-widest uppercase">
              {t("connect")}
            </h3>
            <div className="mb-6 flex gap-3">
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-ink-700 hover:border-ink-300 hover:text-ink-50 flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors"
                >
                  FB
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-ink-700 hover:border-ink-300 hover:text-ink-50 flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors"
                >
                  IG
                </a>
              )}
              {socialLinks?.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-ink-700 hover:border-ink-300 hover:text-ink-50 flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors"
                >
                  TK
                </a>
              )}
              {socialLinks?.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-ink-700 hover:border-ink-300 hover:text-ink-50 flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors"
                >
                  YT
                </a>
              )}
            </div>

            {/* Trust badges */}
            <div className="space-y-2">
              {[t("badgeCod"), t("badgePayment"), t("badgeQuality"), t("badgeDelivery")].map(
                (badge) => (
                  <p key={badge} className="text-ink-500 text-xs">
                    ✓ {badge}
                  </p>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-ink-800 border-t px-4 py-4 md:px-8">
        <div className="max-w-container mx-auto flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-ink-500 text-xs">{t("rights", { year: new Date().getFullYear() })}</p>
          <p className="text-ink-600 text-xs">{t("tagline")}</p>
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
    return <p className="text-sm text-green-400">{t("subscribed")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-0">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        required
        className="border-ink-700 bg-ink-800 text-ink-50 placeholder:text-ink-600 focus:border-ink-400 flex-1 rounded-l-md border-2 border-r-0 px-3 py-2 text-sm outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="border-ink-700 rounded-r-md border-2 bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500 disabled:opacity-50"
      >
        {status === "loading" ? "…" : t("go")}
      </button>
    </form>
  );
}
