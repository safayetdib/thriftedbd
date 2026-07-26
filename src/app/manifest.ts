import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "thriftedBD - Imported Preloved Fashion",
    short_name: "thriftedBD",
    description:
      "Unique thrifted and secondhand clothing in Bangladesh. Every piece is one of a kind.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    // ink-900 - the design system's only brand colour (globals.css).
    theme_color: "#111111",
    lang: "en",
    dir: "ltr",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/icons/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // The brand icon has a full-bleed amber field, so it survives the
        // maskable safe-zone crop on Android without a letter clip.
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
