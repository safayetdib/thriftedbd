<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# thriftedBD - Business & Technical Blueprint

This document contains high-signal, repo-specific instructions for AI agents working in this repository.

## 1. Developer Commands & Workflow
- **Verification Chain:** Run this exact chain before completing any work:
  `pnpm typecheck && pnpm lint && pnpm test`
- **Run a Single Test File:** `pnpm vitest run <path-to-test-file>` (e.g., `pnpm vitest run src/lib/services/order.service.test.ts`)
- **Seeding:** `pnpm run seed` runs `scripts/seed.ts` via tsx. `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` env vars are only needed here, not at runtime.
- **Format:** `pnpm run format` (Prettier). Pre-commit (Husky) auto-runs `lint-staged` - ESLint fix + Prettier on staged files.
- **Git Hook Policy:** Pre-push runs `pnpm typecheck && pnpm lint`.
- **NO Commits/Pushes:** Never execute `git commit` or `git push`. Leave changes staged/uncommitted.

## 2. Architecture & File Conventions
- **Package Manager:** pnpm. Single-package repo (`pnpm-workspace.yaml` only has `ignoredBuiltDependencies`).
- **App Boundary:** Next.js v16 + React v19. Admin (`/admin`) and storefront are in the same Next.js application.
- **Middleware Relocation:** Renamed to `src/proxy.ts` (default export stays `proxy`). **DO NOT** recreate `middleware.ts`.
- **Thin Route Handlers:** Routes (in `src/app/api/.../route.ts`) only handle request parsing/response wrapping. All database reads and writes live in `src/lib/services/{collection}.service.ts`.
- **Validation:** Every API route validates inputs with Zod v4 schemas in `src/lib/validations/` before database interactions.
- **Self-Hosted Auth:** NextAuth v5 + JWT credentials provider. Two credentials providers: `admin` and `customer`.
- **Auth Helpers:** `requireAdmin()` / `requireCustomer()` in `src/lib/api-auth.ts` return 401/403 `NextResponse` or null.
- **@auth/core Hack:** `@auth/core` is an explicit `devDependency` - needed for TS module augmentation in `src/types/next-auth.d.ts` under pnpm strict isolation.
- **Locale Routing:** English is unprefixed (`/products/...`), Bangla gets `/bn/` prefix (`/bn/products/...`). Admin sits outside `[locale]` - never localized. Configured in `src/i18n/routing.ts` using next-intl with `localePrefix: "as-needed"`.
- **Fonts:** Inter (variable, 400–900), Noto Sans (fallback), Noto Sans Bengali - loaded in `src/app/layout.tsx` as CSS variables.
- **CSS:** Tailwind CSS v4 with `@tailwindcss/postcss` plugin. Design tokens in `DESIGN.md` (Wise-inspired palette).

## 3. Critical Domain & Business Invariants
- **Unique-Item Inventory:** Products are unique secondhand pieces with 0 or 1 stock. Avoid traditional multi-stock assumptions.
- **No Hard Deletes:** Deactivate or archive entities (`products`, `categories`, `colors`, `owners`, `blacklist`) using status flags (e.g. `isActive`, `status: "ARCHIVED"`) instead of deleting.
- **Stock Decrements ONLY on Confirmation:** Stock never changes on cart addition or order placement. It only changes on the `PENDING → CONFIRMED` order status transition (once phone call is `CONFIRMED` and any required advance payment is settled).
- **Stock Restores:** `CANCELLED` and `RETURNED` transitions must increment stock back and set the product back to `ACTIVE`.
- **Order Total Recalculation:** Recalculate totals on the server at confirmation time; never trust client-provided prices, totals, or stock values.
- **Snapshot Policy:** Order line items (`items`), owner (`ownerName`, `ownerId`), and price must be fully snapshotted in `orders` at checkout. Later changes to products or owners must not retroactively alter past orders.
- **No Online Payment API:** bKash/Nagad/Bank transfers are received in personal accounts and verified manually via transaction IDs.
- **Independent Cash Ledger:** Record all cash movements in the `transactions` collection. Courier remittances (Steadfast/Pathao) are often batch-settled across multiple orders.
- **Multi-Document Writes:** Writing/updating more than one collection/document (e.g., order confirmation, cancellation, cart-to-order, remittance reconciliation) **must** use a Mongoose session/transaction.
- **Blacklisted Phones & Risk Flags:** Checking `customer.phone` against the `blacklist` collection must trigger a `"BLACKLISTED_PHONE"` flag and force `advancePayment.required = true`.
- **Unreachable Phone Orders:** Orders with unreachable confirmation calls must be held/suspended (set `"ON_HOLD"` or `"UNREACHABLE"`), never cancelled.

## 4. Internationalization & SEO
- **Bilingual Content:** Customer-facing fields store `{ en: string, bn?: string }` objects.
- **Fallback Rule:** If `bn` is missing, fallback to rendering `en`. Do not show empty text.
- **Latin-only Slugs:** URL slugs (e.g., `products.slug`, `categories.slug`) stay Latin/English. URLs are never translated.
- **Translate API:** Server-side Google Cloud Translation API (`GOOGLE_TRANSLATE_API_KEY`) is used to auto-translate Bangla fields as editable drafts. If it fails, save `bn` as empty rather than blocking the admin.
- **SEO & Structured Data:** Every route uses Next.js dynamic `generateMetadata()`. PDPs require `Product` JSON-LD schema. PLPs require `ItemList`. Headings require proper semantic tags (e.g., exactly one `<h1>`).

## 5. Tooling & Testing Quirks
- **Shared Replica Set:** Tests run on `MongoMemoryReplSet` instead of single-node `MongoMemoryServer` because multi-document Mongoose transactions require a replica set.
- **Sequenced Tests:** `fileParallelism: false` is configured in `vitest.config.ts`. Tests must run sequentially to avoid collection collision.
- **High Timeout on First Run:** First run of tests downloads the MongoDB binary. If downloading takes time, ensure timeout is set high (`hookTimeout: 120000`).
- **Test Helpers:** `src/lib/test/mongo.ts` exports `connectTestDB`/`disconnectTestDB`/`clearTestDB`. `src/lib/test/fixtures.ts` exports `makeProduct()`, `makeCart()`, etc. Colocate new tests as `*.test.ts` next to the module under test.
- **Cloudflare R2 Direct Uploads:** Images upload directly to Cloudflare R2 via presigned URLs generated server-side. The Next.js server never receives or processes file buffers.

## 6. On-Demand Guides
For deep specifications, read these specialized files before starting:
- `docs/database-schema.md` - Field-by-field collection references
- `docs/api-conventions.md` - REST structure, validation, and status codes
- `docs/testing-rules.md` - Testing requirements for business-critical logic
- `docs/seo-ai-guidelines.md` - Metadata, semantic HTML, and LLM discoverability (`llms.txt`)
- `docs/i18n-guidelines.md` - prefix routing (`/bn/...`), fallback, and translation forms
- `docs/security-guidelines.md` - PII masking, rate-limiting, and env var secrets
