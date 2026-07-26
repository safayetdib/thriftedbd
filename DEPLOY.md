# Deploying thriftedBD to Render (free tier)

Stack: **Render** (app) · **MongoDB Atlas** (DB) · **Cloudflare R2** (images) · **Cloudflare** (DNS/CDN/WAF). All free.

Config lives in [`render.yaml`](./render.yaml). Follow the steps in order.

---

## 1. MongoDB Atlas (free M0)

1. Create a free **M0** cluster — region **Mumbai (ap-south-1)** or **Singapore** (near Render's Singapore region and your users).
2. **Database Access** → add a DB user (username + password).
3. **Network Access** → allow `0.0.0.0/0` (Render's egress IPs aren't static on the free tier).
4. Copy the connection string → this is `MONGODB_URI` (append the DB name, e.g. `.../thriftedbd?retryWrites=true&w=majority`).

## 2. Push the repo (render.yaml + any pending changes)

```bash
git add -A
git commit -m "Add Render deploy config"
git push origin main
```

## 3. Create the Render service

1. Render dashboard → **New → Blueprint** → pick `safayetdib/thriftedbd`.
2. Render reads `render.yaml` and creates the `thriftedbd` web service (free, Singapore).
3. When prompted, fill the **secret env vars** (the `sync: false` ones):
   - `MONGODB_URI` — from step 1
   - `AUTH_SECRET` — generate: `openssl rand -base64 32` (or `npx auth secret`)
   - `AUTH_URL` — `https://thriftedbd.com`
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` — from your Cloudflare R2 dashboard (same values you use locally in `.env.local`)
4. Deploy. First build takes a few minutes.

## 4. Seed the admin account

The prod DB is empty. In Render → your service → **Shell**, add `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` env vars first, then run:

```bash
pnpm seed
```

This creates your superadmin user + base settings (it does **not** load dummy products). Log in at `/admin/login`.

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

## 6. Point the domain (Cloudflare)

1. Render → service → **Settings → Custom Domains** → add `thriftedbd.com` and `www.thriftedbd.com`. Render shows a target (a `*.onrender.com` host).
2. In **Cloudflare DNS**, add a `CNAME` for `thriftedbd.com` (Cloudflare flattens the apex) and `www` pointing at Render's target.
   - **Set the record to DNS-only (grey cloud) first** so Render can issue its TLS cert. Once Render shows the domain as verified/secured, switch the proxy back **on (orange cloud)**.
3. Cloudflare → **SSL/TLS → Overview → Full (strict)**.
4. With the proxy on you now get Cloudflare CDN + WAF + DDoS. Optionally add a **Rate Limiting rule** for `/login`, `/checkout`, and order-tracking (complements the app-level limiter already in the code).

## 7. Verify

- `https://thriftedbd.com` loads over HTTPS.
- `/api/health` → `{"data":{"status":"ok","db":"connected"}}`
- `/sitemap.xml` and `/robots.txt` resolve (they hardcode `https://thriftedbd.com`).
- Admin: create a product, upload a WebP image (confirms R2 CORS), see it on the storefront.
- Place a test COD order end-to-end.

---

## Free-tier caveats

- **Cold starts:** the free instance sleeps after ~15 min idle; the first request after that waits ~30–60s. Fine to launch; upgrade to the ~$7/mo instance (or move to Oracle Always Free) to keep it warm.
- **512 MB RAM:** if `next build` ever OOMs, add env `NODE_OPTIONS=--max-old-space-size=512` (or upgrade the build).
- **Migrating later:** everything except the Render service is portable. To move to Oracle/Fly, just repoint Cloudflare DNS and set the same env vars — DB (Atlas) and images (R2) stay put.
