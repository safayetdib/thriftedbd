<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# thriftedBD — Business & Technical Blueprint

Source of truth for business rules, data model, and operational flow. Read this before making changes to schema, order logic, or admin workflows.

## 1. Business overview

thriftedBD is an online thrifted/secondhand clothing e-commerce platform operating in Bangladesh.

- Clothing inventory is purchased in bulk through bales, held physically by one of a small number of people (see `owners` below).
- Individual pieces are manually selected and uploaded to the site — each product is unique, mostly one piece per SKU.
- The platform is a **unique-item inventory management system**, not a traditional multi-stock e-commerce system.
- Admin manages inventory, products, and orders through an internal dashboard (`/admin`), in the same Next.js app as the storefront.

## 2. Customer journey

1. Customer discovers a product on Facebook or the website.
2. Places an order on the website (name, phone, address, product).
3. Receives an order confirmation message (SMS/WhatsApp/Email).
4. thriftedBD calls to confirm the order before dispatch.
5. Parcel is dispatched via Steadfast or Pathao with tracking.
6. Customer receives the parcel and pays cash to the courier (COD).
7. Customer receives a delivery confirmation message.

## 3. Order handling rules

- Every order requires a phone confirmation call before dispatch. Orders with unreachable numbers are held, not cancelled.
- Red flags — invalid number, a large order from a new buyer, an unconfirmed address, or a blacklisted phone — trigger an advance payment request before the order can proceed.
- Confirmed orders are created as parcels on the Steadfast/Pathao merchant dashboard.
- A tracking link is sent to the customer after dispatch.
- Failed deliveries get logged against the customer's phone number (`blacklist` collection — replaces the manual spreadsheet).

## 4. Cash handling rules

- Customer pays COD to the courier at delivery.
- The courier (Steadfast/Pathao) remits collected cash to thriftedBD's bKash or bank account within 1–3 days of delivery confirmation. A single remittance can cover multiple delivered orders at once.
- Online payments (bKash/Nagad Send Money) are received directly into a personal account — there is no payment gateway API, so these are manually verified by transaction ID.
- **All cash movement is logged** in the `transactions` collection, separate from individual orders, since remittances are often batched across multiple orders.

## 5. Database schema

11 MongoDB collections: `categories`, `colors`, `owners`, `products`, `orders`, `users`, `customers`, `settings`, `carts`, `transactions`, `blacklist`.

**Full field-by-field reference lives in [`docs/database-schema.md`](./docs/database-schema.md) — read it before writing Mongoose models, API routes that touch the database, or migrations.** It's kept out of this always-loaded file because most tasks (UI, styling, copy) don't need the full schema in context.

## 6. SEO & AI search

**Before building or editing any storefront route, layout, or content component, read [`docs/seo-ai-guidelines.md`](./docs/seo-ai-guidelines.md)** — metadata, structured data (JSON-LD), semantic HTML, image alt text, Core Web Vitals, sitemap/robots, and AI-answer-engine optimization. Kept out of this always-loaded file for the same reason as the DB schema: only needed when actually touching frontend pages.

## 7. Internationalization (English / Bangla)

The site fully supports an English (default) / Bangla toggle, including translated product listings, not just UI chrome. **Before building any storefront route, the language switcher, or admin product forms, read [`docs/i18n-guidelines.md`](./docs/i18n-guidelines.md)** — locale routing, which fields are bilingual, fallback rules, and the slug-stays-Latin rule.

## 8. API, security, and testing conventions

Three more on-demand references, same reasoning as above — read whichever is relevant before touching that part of the codebase:
- [`docs/api-conventions.md`](./docs/api-conventions.md) — route structure, Zod validation, the service layer, **multi-document transactions** (order confirmation, cancellation, remittance reconciliation all require one), response shape, and status codes.
- [`docs/security-guidelines.md`](./docs/security-guidelines.md) — input/query safety, auth, secrets, uploads, rate limiting, PII handling.
- [`docs/testing-rules.md`](./docs/testing-rules.md) — which logic must ship with a test (stock/order-confirmation/payment paths) before merge, and what's explicitly not worth testing.

## 9. Auth: self-hosted, not a managed identity provider

Deliberately **not** using Clerk/Auth0/Supabase Auth/Firebase Auth, even on their free tiers. We need our own `customers` collection regardless (addresses, favorites, order history, bilingual fields), so a managed provider would add a second identity system to sync rather than remove work — and NextAuth + bcrypt already handles the hard parts (CSRF, JWT signing, secure cookies) for free. Stick with NextAuth v5, JWT sessions, two Credentials providers (`admin`, `customer`).

## 10. Core rules for AI agents

1. Keep admin and storefront in the same Next.js application. Do not create a separate backend unless required.
2. Products are unique thrift pieces — avoid rigid multi-stock e-commerce assumptions.
3. Support custom/flexible attributes (category tree, color, size) — never hardcode a fixed list where the business needs to add new values.
4. Never hard delete anything — products, categories, colors, owners, blacklist entries all use a status/`isActive` flag instead.
5. Stock changes only after order confirmation (`confirmationCall` cleared **and** advance payment cleared if required) — never on cart-add or order placement.
6. Order-creation API must re-check `product.status === "ACTIVE"` at confirmation time — unique items can sit in multiple carts simultaneously, so a race condition is possible.
7. Images must upload directly to Cloudflare R2 via presigned URLs — the server never handles image files.
8. Guest checkout always works; customer accounts are an upgrade (saved addresses, favorites, persistent cart, order history), never a requirement to buy.
9. Order line items, owner, and price are fully snapshotted at order time — later edits to `products`, `owners`, `categories`, or `colors` must never retroactively change a past order.
10. Cash movement is logged in `transactions`, independent of `orders`, since courier remittances are frequently batched across multiple delivered orders.
11. Multi-document writes (order confirmation, cancellation/return, remittance reconciliation) must use a MongoDB transaction — never partial-write across collections.
12. Bilingual text (`products.title`/`notes`, `categories.name`, `colors.name`) is stored as `{ en, bn? }`; `bn` is optional and falls back to `en`, but slugs are always Latin/English regardless of display language.
13. Optimize for low cost and future scalability.
14. **Never run `git commit` (or `git push`).** Make the code/file changes and stop there — the project owner reviews the diff and commits it themselves.
15. This Next.js version renamed `middleware.ts` to `src/proxy.ts` (export stays default/`proxy`) — confirmed by `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`. Don't recreate `middleware.ts`.
16. `@auth/core` must stay an explicit `devDependency` even though it's only a transitive dependency of `next-auth` — pnpm's strict `node_modules` isolation means type-augmentation files (`src/types/next-auth.d.ts`) can't resolve `@auth/core/*` otherwise.
