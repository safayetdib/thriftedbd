import { getLocale } from "next-intl/server";
import { connectDB } from "@/lib/db";
import { getActiveCategories } from "@/lib/services/category.service";
import { getCart } from "@/lib/services/cart.service";
import { getPublicSettings } from "@/lib/services/settings.service";
import { peekCartIdentity } from "@/lib/cart-identity";
import { localize } from "@/lib/localize";
import type { ICartItem } from "@/models/Cart";
import { SiteHeader } from "@/components/storefront/header";
import { SiteFooter } from "@/components/storefront/footer";

type SubCategory = { slug: string; name: string; coverImage?: { url: string; key: string } };
type Department = {
  slug: string;
  name: string;
  coverImage?: { url: string; key: string };
  children: SubCategory[];
};

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  await connectDB();
  const locale = await getLocale();
  const identity = await peekCartIdentity();
  const [categories, cart, settings] = await Promise.all([
    getActiveCategories(),
    identity ? getCart(identity) : null,
    getPublicSettings(),
  ]);

  // Build category tree: departments with their subcategories
  const deptMap = new Map<string, Department>();
  for (const cat of categories.filter((c) => c.level === 0)) {
    deptMap.set(String(cat._id), {
      slug: cat.slug,
      name: localize(cat.name, locale),
      coverImage: cat.coverImage,
      children: [],
    });
  }
  for (const cat of categories.filter((c) => c.level === 1)) {
    const parent = cat.parentId ? deptMap.get(String(cat.parentId)) : undefined;
    if (parent) {
      parent.children.push({
        slug: cat.slug,
        name: localize(cat.name, locale),
        coverImage: cat.coverImage,
      });
    }
  }
  const departments = [...deptMap.values()];

  const cartCount =
    cart?.items.reduce((sum: number, item: ICartItem) => sum + item.quantity, 0) ?? 0;

  const announcement = localize(settings.announcement, locale) || null;

  return (
    <>
      <a
        href="#main-content"
        className="focus:ring-ink-900 sr-only fixed top-0 left-0 z-[100] m-2 rounded-sm bg-white px-4 py-2 text-sm font-semibold focus:not-sr-only focus:ring-2"
      >
        Skip to content
      </a>
      {announcement && (
        <div className="bg-ink-900 text-ink-100 px-4 py-2 text-center text-sm font-medium">
          {announcement}
        </div>
      )}
      <SiteHeader departments={departments} cartCount={cartCount} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter socialLinks={settings.socialLinks} departments={departments} />
    </>
  );
}
