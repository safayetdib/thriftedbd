# thriftedBD — Security Guidelines

Read this before writing any route handler, auth logic, or upload flow. PII (phone, address) and money flows are involved from day one, so these aren't optional hardening for "later."

## 1. Input & query safety
- Zod validation at every API boundary (see `docs/api-conventions.md`).
- Never interpolate raw user input into a Mongoose filter; pass plain validated objects, never raw strings into `$where`-style operators.

## 2. Auth
- NextAuth, JWT session strategy, two Credentials providers (`admin`, `customer`) — see `AGENTS.md` for why this stays self-hosted rather than a managed identity provider.
- `/admin/*` middleware requires `role === "admin"`; `/account/*` requires `role === "customer"`.
- Passwords hashed with bcrypt; never log plaintext passwords, hashes, or session tokens.

## 3. Secrets
- All secrets (Mongo URI, R2 keys, `AUTH_SECRET`, `GOOGLE_TRANSLATE_API_KEY`) live in env vars, never committed. `.env.example` documents every required variable with a placeholder.
- Secrets are only ever read in server-side code (route handlers, server components) — never in a `"use client"` file, never sent to the browser bundle.

## 4. Uploads
- R2 presigned URLs are scoped to a specific content-type and max file size. Client-side validation is UX only — the presigned URL's constraints are the actual security boundary.

## 5. Rate limiting
- Public endpoints that are abuse targets — login, order placement, order-tracking lookup — need rate limiting (Cloudflare in front, plus an app-level guard on login attempts specifically).

## 6. PII handling
- Customer phone/address is only readable by authenticated admin sessions.
- Never log full phone numbers or addresses in plaintext — mask in any console/error logging.
