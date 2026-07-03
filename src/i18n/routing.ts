import { defineRouting } from "next-intl/routing";

/**
 * English is the default and stays unprefixed (/products/...), Bangla gets a
 * /bn prefix (/bn/products/...) — per docs/i18n-guidelines.md §1. Locale
 * preference persists via the NEXT_LOCALE cookie (next-intl's default).
 */
export const routing = defineRouting({
  locales: ["en", "bn"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
