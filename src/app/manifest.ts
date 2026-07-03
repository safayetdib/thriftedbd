import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "thriftedBD — Imported Preloved Fashion",
    short_name: "thriftedBD",
    description:
      "Unique thrifted and secondhand clothing in Bangladesh. Every piece is one of a kind.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1c1b19",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
