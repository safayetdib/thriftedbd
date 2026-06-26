# thriftedBD — SEO & AI Search Guidelines

Apply this checklist whenever building or editing any storefront route, layout, or content component. Goal: maximize discoverability in Google search **and** in AI answer engines (ChatGPT, Perplexity, Google AI Overviews, Claude) that increasingly mediate shopping research.

## 1. Metadata — every route needs this
- Use Next.js `generateMetadata()` per page, never a single static title for the whole site.
- `title`: `{Product Title} – {Brand} | thriftedBD` for PDPs; `{Category} | thriftedBD` for PLPs. Keep under ~60 chars.
- `description`: unique per page, 120–160 chars, written for humans (not keyword-stuffed) — mention condition, brand, price range for PDPs.
- `canonical` URL on every page (especially PLPs with filter/sort query params — canonical should point to the unfiltered category URL to avoid duplicate-content dilution).
- Open Graph (`og:title`, `og:description`, `og:image`, `og:type=product`) + Twitter card on every PDP — this is also what AI assistants and chat apps use when someone shares a product link.

## 2. Structured data (JSON-LD) — non-negotiable for AI extraction
AI answer engines and Google both rely on structured data to extract facts reliably rather than guessing from rendered text.
- **Every PDP**: `Product` schema — `name`, `brand`, `image`, `description`, `offers` (`price`, `priceCurrency: "BDT"`, `availability` mapped from `status`/`stock`, `itemCondition` mapped from `condition`).
- **Every PLP**: `ItemList` schema referencing the visible products.
- **Every page**: `BreadcrumbList` schema matching the visible breadcrumb (department → category → subcategory).
- **Site-wide** (root layout): `Organization` schema (name, logo, `sameAs` social links from `settings.socialLinks`) and `WebSite` schema with a `SearchAction` if/when site search ships.
- Validate with Google's Rich Results Test before merging any change to product/category templates.

## 3. Semantic HTML & heading hierarchy
- Exactly one `<h1>` per page (PDP: product title; PLP: category name; home: hero headline).
- Don't skip heading levels for visual reasons — if a section needs to look like an `h4` but is structurally an `h2`, style the `h2` to look smaller; never reach for a lower heading tag just for size.
- Use `<nav>`, `<main>`, `<article>`, `<button>` vs `<div onClick>` correctly — both crawlers and AI extraction pipelines weight semantic tags more heavily than generic `<div>`s.

## 4. Images
- Every `<Image>` needs real, descriptive `alt` text (e.g. `"Nike hoodie, navy, size M, front view"`) — never `alt="image"` or empty alt on content images. Decorative-only images get `alt=""`.
- LCP image (hero, first product image above the fold) gets `priority`; everything else lazy-loads by default (`next/image` default).
- Serve via `next/image` with correct `sizes` for the grid — avoids layout shift (CLS) and oversized payloads, both Core Web Vitals signals Google uses directly in ranking.

## 5. URL structure
- Stable, human-readable slugs (`/products/nike-hoodie-navy-m-tbd-000123`), never raw ObjectIds in user-facing URLs.
- Category URLs follow the tree (`/women/trousers/palazzo`), not query-string-only (`?cat=123`) — query params are fine for filters/sort on top of a real path, not as the only addressing scheme.
- 301-redirect old slugs if a product is ever re-slugged; never let old indexed URLs 404.

## 6. Performance (Core Web Vitals)
- LCP target < 2.5s, CLS < 0.1, INP < 200ms — these are direct Google ranking factors, not just nice-to-haves.
- No client-side-only rendering for primary content — PDPs/PLPs render server-side (Next.js App Router default) so both Googlebot and AI crawlers (which often don't execute JS) see full content immediately.
- Fonts already use `next/font` with `display: swap` — keep this pattern for any future font additions.

## 7. Sitemap & robots.txt
- `app/sitemap.ts` — dynamically generated, includes all `ACTIVE` products and the full category tree; excludes `DRAFT`/`ARCHIVED` products and `/admin`/`/account`.
- `app/robots.ts` — disallow `/admin`, `/account`, `/checkout`, `/api`; allow everything else.
- Resubmit sitemap to Google Search Console after any major URL-structure change.

## 8. AI search / answer engine optimization (newer, beyond classic SEO)
- **Write factual, extractable copy.** AI answer engines lift specific facts (price, condition, brand, size, availability) more reliably from clear sentences and structured data than from marketing fluff — keep product descriptions factual first, persuasive second.
- **`llms.txt`** at the site root — an emerging convention (like `robots.txt` but for LLM crawlers) summarizing what the site sells and linking to key pages. Low cost, growing adoption, worth having.
- **Allow AI crawlers deliberately**, don't block by accident. Common AI crawler user-agents: `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `CCBot`.
  - **Open decision, not yet confirmed:** the goal here is product *discovery* (someone asking an AI "where can I buy a vintage Nike hoodie in Dhaka"), which argues for explicitly allowing these in `robots.txt` rather than the default-block some boilerplates ship with. Until this is confirmed with the business owner, leave `robots.txt` permissive (no explicit block) but flag it for an explicit decision before launch.
- **FAQ content gets `FAQPage` schema** — common pre-purchase questions (delivery time, COD availability, return policy) formatted as visible Q&A win both Google's "People also ask" and AI answer boxes.
- **Avoid AI-unfriendly patterns**: infinite scroll with no indexable pagination links, content that only appears after a click/hover with no server-rendered fallback, text baked into images instead of real text.

## 9. Quick per-page checklist
- [ ] Unique `title` + `description` via `generateMetadata`
- [ ] Canonical URL set
- [ ] OG/Twitter tags present
- [ ] Relevant JSON-LD (`Product`/`ItemList`/`BreadcrumbList`) present and valid
- [ ] Single `<h1>`, no skipped heading levels
- [ ] All images have real `alt` text
- [ ] No client-only rendering of primary content
- [ ] New route added to `sitemap.ts` if publicly indexable
