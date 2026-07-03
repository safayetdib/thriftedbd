import type { Metadata } from "next";
import { Inter, Noto_Sans, Noto_Sans_Bengali } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

// Noto Sans — fallback for Latin characters (lower-priority than Inter).
const noto = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto",
  display: "swap",
});

// Bangla glyphs for the /bn locale — falls into the font stack after Inter
// and Noto Sans, so Latin text keeps Inter's metrics while Bengali stays crisp.
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "thriftedBD — Imported preloved fashion",
  description:
    "Quality-checked, imported thrifted fashion from Korea, Japan, Taiwan & China. COD across Bangladesh.",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://thriftedbd.com/#organization",
      name: "thriftedBD",
      url: "https://thriftedbd.com",
      description:
        "Online thrifted/secondhand clothing platform in Bangladesh. Quality-checked preloved fashion imported from Korea, Japan, Taiwan & China.",
    },
    {
      "@type": "WebSite",
      "@id": "https://thriftedbd.com/#website",
      url: "https://thriftedbd.com",
      name: "thriftedBD",
      publisher: { "@id": "https://thriftedbd.com/#organization" },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved from the URL by next-intl; admin routes (outside the [locale]
  // segment) fall back to "en".
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${inter.variable} ${noto.variable} ${notoBengali.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
