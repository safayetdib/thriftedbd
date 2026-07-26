import type { I18nText, I18nTextOptional } from "@/models/shared";

/**
 * Picks the display string from a bilingual `{ en, bn? }` field. Bangla falls
 * back to English when missing/empty - never render a blank string
 * (docs/i18n-guidelines.md §3).
 */
export function localize(
  text: I18nText | I18nTextOptional | undefined | null,
  locale: string,
): string {
  if (!text) return "";
  if (locale === "bn" && text.bn) return text.bn;
  return text.en ?? "";
}
