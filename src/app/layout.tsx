import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${noto.variable} h-full antialiased`}>
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
