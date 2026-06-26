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
- Every bilingual field (title, notes, image alt text) gets two inputs — English (required) and Bangla (optional, with a visible "not translated yet" state if empty) — not a single field with a language dropdown, so the admin can see and fill both at a glance while creating a listing.

## 5. What this does NOT cover yet
- Bangla input/search (e.g. searching the catalog by typing in Bangla) — not in scope until the search feature itself is built; flag for that point, don't build speculatively now.
- SSR/SEO `hreflang` tags — add once both locales are actually live in production, not before.
