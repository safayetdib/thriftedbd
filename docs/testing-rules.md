# thriftedBD — Testing Rules

Read this before changing order, stock, or payment logic.

## 1. Must ship with a test (non-negotiable)
- Stock decrements **only** on the `PENDING → CONFIRMED` transition, never anywhere else.
- `CANCELLED` and `RETURNED` correctly restore stock (+1, product back to `ACTIVE`).
- Order-creation re-checks `product.status === "ACTIVE"` and rejects if the item sold out from under the request (the race-condition guard).
- Server-side order total calculation (items + shipping fee) matches the expected sum, never trusting a client-sent total.
- Risk-flag logic — large-order threshold, blacklist phone match — sets `riskFlags`/`advancePayment.required` correctly.
- Multi-document writes (order confirmation, cancellation/return, remittance reconciliation) actually roll back on failure — see the transaction pattern in `docs/api-conventions.md`.

## 2. How
- Unit tests (Vitest) for pure logic — price calculation, risk-flag evaluation.
- Integration tests for the API routes above, against a real (test-only) MongoDB instance — `mongodb-memory-server` recommended over mocking Mongoose, since the whole point is catching real query/transition bugs.
- Colocate as `*.test.ts` next to the module it tests.

## 3. Gate
- Extend the existing pre-push hook (`pnpm typecheck && pnpm lint`) to also run `pnpm test` once a runner is installed — don't push if a critical-path test fails.

## 4. What's explicitly NOT required
- Visual/UI components, simple admin CRUD forms, styling. Testing budget stays on business-critical logic only — matches the "optimize for low cost" principle already in `AGENTS.md`.
