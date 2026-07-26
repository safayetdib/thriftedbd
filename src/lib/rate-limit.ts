/**
 * Minimal in-memory rate limiter - a first-line abuse guard for public
 * endpoints (login, signup, order placement, order tracking) per
 * docs/security-guidelines.md §5.
 *
 * Scope & limitations: state lives in a per-process Map, so limits are
 * per-instance and reset on redeploy. This is a defence-in-depth layer, NOT a
 * substitute for an edge/WAF limiter - keep Cloudflare (or similar) in front in
 * production. For a multi-instance deployment, back this with Redis instead.
 */

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Fixed-window counter. Each call counts as one hit; returns `ok: false` once
 * `limit` hits accrue within `windowMs`, until the window rolls over.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

/**
 * Best-effort client IP from proxy headers. Cloudflare and most proxies set
 * `x-forwarded-for`; the first entry is the originating client. Falls back to a
 * shared "unknown" bucket when absent (dev / direct connections).
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}
