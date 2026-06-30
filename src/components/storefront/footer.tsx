import Link from "next/link";

type SocialLinks = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
};

export function SiteFooter({ socialLinks }: { socialLinks?: SocialLinks }) {
  const socials = [
    { label: "Facebook", href: socialLinks?.facebook },
    { label: "Instagram", href: socialLinks?.instagram },
    { label: "TikTok", href: socialLinks?.tiktok },
    { label: "YouTube", href: socialLinks?.youtube },
  ].filter((s) => s.href);

  return (
    <footer className="border-ink-900 bg-ink-900 text-ink-300 mt-auto border-t-2 px-4 py-12 md:px-8">
      <div className="max-w-container mx-auto grid w-full grid-cols-2 gap-8 md:grid-cols-4">
        <div>
          <p className="text-eyebrow text-ink-50 mb-3">Shop</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/products" className="hover:text-ink-50">
                All products
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-eyebrow text-ink-50 mb-3">Help</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/cart" className="hover:text-ink-50">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-eyebrow text-ink-50 mb-3">About</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>Imported preloved fashion</li>
          </ul>
        </div>
        {socials.length > 0 && (
          <div>
            <p className="text-eyebrow text-ink-50 mb-3">Connect</p>
            <ul className="flex flex-col gap-2 text-sm">
              {socials.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ink-50"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="max-w-container border-ink-700 text-ink-500 mx-auto mt-10 w-full border-t-2 pt-6 text-xs">
        © {new Date().getFullYear()} thriftedBD. COD · bKash · Nagad accepted.
      </div>
    </footer>
  );
}
