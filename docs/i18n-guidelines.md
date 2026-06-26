# thriftedBD — Internationalization (English / Bangla) Guidelines

The site fully supports English (default) and Bangla, switchable via a toggle in the header. Read this before building any storefront route, the language switcher, or admin product forms.

## 1. Routing
- Use **next-intl** with locale-prefixed routing: English is the default and stays **unprefixed** (`/products/...`), Bangla gets a `/bn/` prefix (`/bn/products/...`).
- The language toggle navigates to the equivalent localized path for the current page — it's a real route change, not just a client-side string swap. This keeps both languages independently crawlable/indexable (ties into `docs/seo-ai-guidelines.md` — add `hreflang` alternates once both locales are live).
- Locale preference persists via the `NEXT_LOCALE` cookie so a returning visitor lands on their last-used language.

## 2. Two kinds of translated content
1. **UI chrome** — nav labels, buttons, checkout copy, system/error messages, footer, enum display labels (`condition`, `grade`, `orderStatus`). Lives in `messages/en.json` / `messages/bn.json`, loaded via `next-intl`. Translate once, applies everywhere that string is used.
2. **Database content** — anything admin-entered that's customer-facing. Stored as `{ en, bn? }` objects directly on the document. See `docs/database-schema.md` → "Bilingual fields" for the exact list (`products.title`/`notes`/`images[].alt`, `categories.name`, `colors.name`, `settings.announcement`, and the order/cart item-title snapshots).

## 3. Rules
- **Fallback**: if a document's `bn` field is missing or empty, render `en`. Bangla is never required to save/publish a product — the admin can add it later. Never show a blank string.
- **Slugs stay Latin/English** always (`products.slug`, `categories.slug`) — URLs are never translated, only the content displayed at that URL.
- **Proper nouns aren't translated** — brand names (`products.brand`), people's names (`owners.name`, `customers.name`), and internal-only admin notes (`blacklist.reason`, `transactions.notes`) stay plain strings in whatever language they were typed.
- **Closed enums get one translation, not one per record** — `grade`, `condition`, `orderStatus`, badge labels (New/Imported/Premium/Sale/Sold), etc. are translated once in the UI message files. Never add a `{ en, bn }` field to a schema for something that's already a fixed enum.

## 4. Admin product form
- Every bilingual field (title, notes, image alt text) gets two inputs — English (required) and Bangla — not a single field with a language dropdown, so the admin can see and fill both at a glance while creating a listing.
- **Auto-translate as an editable draft.** When the admin saves with the Bangla field empty, the server calls the Google Cloud Translation API to auto-fill it, then returns the draft into the (still editable) Bangla input — never auto-publishes a translation the admin hasn't seen. The admin can leave it, fix a word, or rewrite it entirely before publishing. This is the speed/quality balance: fast by default, correctable when a fashion-specific term or brand reference comes out wrong.
- Brand names and other proper nouns are never sent through translation — they're not part of any bilingual field to begin with (see §3).
- If the translation call fails or errors, leave `bn` empty rather than blocking the save — the existing English-fallback rule (§3) already covers display, so a translation API outage should never stop an admin from publishing a product.
- The API key (`GOOGLE_TRANSLATE_API_KEY`) is a server-side secret — the call happens in the product service (`docs/api-conventions.md`), never from the client.

## 5. What this does NOT cover yet
- Bangla input/search (e.g. searching the catalog by typing in Bangla) — not in scope until the search feature itself is built; flag for that point, don't build speculatively now.
- SSR/SEO `hreflang` tags — add once both locales are actually live in production, not before.
