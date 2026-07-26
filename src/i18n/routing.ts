import { defineRouting } from "next-intl/routing";

/**
 * English-only for now. Bangla (/bn) is disabled — to re-enable, add "bn" back
 * to `locales` and restore the LanguageSwitcher in the header + the hreflang
 * alternates in the root layout. The rest of the next-intl scaffolding
 * (messages/bn.json, localize() fallback) is left intact so it's a quick flip.
 */
export const routing = defineRouting({
  locales: ["en"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
