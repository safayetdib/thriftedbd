# Deploying thriftedBD to Netlify

Stack: **Netlify** (app) · **MongoDB Atlas** (DB) · **Cloudflare R2** (images) · **Cloudflare** (DNS, optional).

Config lives in [`netlify.toml`](./netlify.toml). Netlify's Next.js runtime
(`opennextjs-netlify`, published as `@netlify/plugin-nextjs`) is auto-detected
and auto-installed at build time - it wires up SSR, Server Actions, and Route
Handlers as Netlify Functions, `src/proxy.ts` middleware as an Edge Function,
and `next/image` through the Netlify Image CDN, all with no extra config
beyond what's in `netlify.toml`. Follow the steps in order.

---

## 1. MongoDB Atlas (free M0)

1. Create a free **M0** cluster - region **Mumbai (ap-south-1)** or **Singapore** (closest to Bangladesh).
2. **Database Access** → add a DB user (username + password).
3. **Network Access** → allow `0.0.0.0/0` (Netlify Functions don't have static egress IPs).
4. Copy the connection string → this is `MONGODB_URI` (append the DB name, e.g. `.../thriftedbd?retryWrites=true&w=majority`).

## 2. Push the repo

```bash
git add -A
git commit -m "Switch deploy target to Netlify"
git push origin main
```

## 3. Create the Netlify site

1. Netlify dashboard → **Add new site → Import an existing project** → pick `safayetdib/thriftedbd`.
2. Netlify reads `netlify.toml` for the build command and non-secret env vars.
3. **Site settings → Environment variables**, add the secrets (not committed, `sync: false`-equivalent):
   - `MONGODB_URI` - from step 1
   - `AUTH_SECRET` - generate: `openssl rand -base64 32` (or `npx auth secret`)
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` - from your Cloudflare R2 dashboard (same values you use locally in `.env.local`)
   - `GOOGLE_TRANSLATE_API_KEY` - optional, only needed for the Bangla auto-translate draft
4. Deploy. First build takes a few minutes (the Next.js runtime plugin installs automatically).

## 4. Seed the admin account

The prod DB is empty. In Netlify → your site → **Project configuration → Environment variables**, temporarily add `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, then run the seed script locally against the prod `MONGODB_URI` (Netlify Functions don't offer an interactive shell):

```bash
MONGODB_URI="<prod connection string>" SEED_ADMIN_EMAIL="..." SEED_ADMIN_PASSWORD="..." pnpm seed
```

This creates your superadmin user + base settings (it does **not** load dummy products). Log in at `/admin/login`. Remove the seed env vars afterward - they're only read by `scripts/seed.ts`, never at runtime.

## 5. R2 CORS (required for image uploads to work in prod)

Browser uploads PUT directly to R2 via presigned URLs, so the bucket must allow your prod origin. In Cloudflare → R2 → your bucket → **Settings → CORS Policy**, add:

```json
[
  {
    "AllowedOrigins": ["https://thriftedbd.com"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

(Keep `http://localhost:3000` in the list too if you still upload from local dev.)

## 6. Point the domain

1. Netlify → site → **Domain management** → add `thriftedbd.com` and `www.thriftedbd.com`.
2. Point DNS at Netlify - either delegate to Netlify DNS, or add the CNAME/ALIAS record Netlify shows you at your current registrar/Cloudflare.
3. Netlify auto-provisions free HTTPS (Let's Encrypt) once DNS resolves - no manual cert step.
4. If keeping Cloudflare in front for WAF/rate-limiting, set the proxied record to **DNS-only (grey cloud)** until Netlify shows the domain as verified/secured, then switch back to **proxied (orange cloud)** with SSL/TLS mode **Full (strict)**.

## 7. Verify

- `https://thriftedbd.com` loads over HTTPS.
- `/api/health` → `{"data":{"status":"ok","db":"connected"}}`
- `/sitemap.xml` and `/robots.txt` resolve (they hardcode `https://thriftedbd.com`).
- Admin: create a product, upload a WebP image (confirms R2 CORS), see it on the storefront.
- Open a product image in devtools → Network: confirm it's served via `/_next/image?...` with a long `cache-control` (R2 keys are per-upload UUIDs, so this is safe to cache for a year - see `next.config.ts`).
- Place a test COD order end-to-end.

---

## Notes

- **No cold-start sleep:** unlike Render's free tier, Netlify Functions don't sleep - but they are still per-request Lambda-backed, so an uncached SSR request pays a small (tens–hundreds of ms) cold start on a cold function; fully static/cached routes are served straight from Netlify's CDN edge with no cold start.
- **Function timeout:** Netlify Functions on the free tier time out at 10s. All API routes/Server Actions here (auth, cart, checkout, admin CRUD) are simple DB reads/writes and comfortably fit; the only outbound network call besides MongoDB/R2 is the optional Google Translate call in the admin product form, which is not on a customer-facing hot path.
- **Auth.js host trust:** `AUTH_TRUST_HOST=true` is set in `netlify.toml` - required because Netlify isn't in Auth.js's auto-detected host list (Vercel/Cloudflare Pages are). Without it, sign-in redirects will use the wrong host.
- **Migrating later:** everything except the Netlify site is portable. To move elsewhere, just repoint DNS and set the same env vars - DB (Atlas) and images (R2) stay put.
