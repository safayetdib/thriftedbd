import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Product/media images are served from Cloudflare R2 (R2_PUBLIC_URL is a
    // pub-*.r2.dev subdomain). If you move R2 behind a custom domain, add that
    // hostname here. The old placehold.co / cdn.scenesku.com hosts were only
    // used by dummy seed data and are intentionally not allowed in production.
    remotePatterns: [{ protocol: "https", hostname: "*.r2.dev" }],
  },
};

export default withNextIntl(nextConfig);
