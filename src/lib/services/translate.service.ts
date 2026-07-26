/**
 * Google Cloud Translation auto-fill for bilingual fields, per
 * docs/i18n-guidelines.md §4. Server-side only - the API key must never
 * reach the client. Every failure path returns null instead of throwing:
 * a translation outage must never block an admin from publishing a product
 * (the en-fallback rule already covers display).
 */

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

export async function translateToBangla(text: string): Promise<string | null> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key || !text.trim()) return null;

  try {
    const res = await fetch(`${ENDPOINT}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "en", target: "bn", format: "text" }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const translated = json?.data?.translations?.[0]?.translatedText;
    return typeof translated === "string" && translated.trim() ? translated : null;
  } catch {
    return null;
  }
}

/**
 * Fills `bn` with a machine-translation draft when the admin left it empty.
 *
 * DISABLED: Bangla is turned off across the admin for now, so this is a no-op
 * that returns the value unchanged (no API calls, no `bn` drafts). To re-enable
 * Bangla later, restore the body below and bring back the admin `bn` fields.
 */
export async function withBanglaDraft<T extends { en?: string; bn?: string }>(text: T): Promise<T> {
  return text;
  // if (!text.en || text.bn) return text;
  // const bn = await translateToBangla(text.en);
  // return bn ? { ...text, bn } : text;
}
