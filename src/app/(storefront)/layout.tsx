import { connectDB } from "@/lib/db";
import { getActiveCategories } from "@/lib/services/category.service";
import { getCart } from "@/lib/services/cart.service";
import { getPublicSettings } from "@/lib/services/settings.service";
import { peekCartIdentity } from "@/lib/cart-identity";
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
      name: cat.name.en,
      coverImage: cat.coverImage,
      children: [],
    });
  }
  for (const cat of categories.filter((c) => c.level === 1)) {
    const parent = cat.parentId ? deptMap.get(String(cat.parentId)) : undefined;
    if (parent) {
      parent.children.push({
        slug: cat.slug,
        name: cat.name.en,
        coverImage: cat.coverImage,
      });
    }
  }
  const departments = [...deptMap.values()];

  const cartCount =
    cart?.items.reduce((sum: number, item: ICartItem) => sum + item.quantity, 0) ?? 0;

  const announcement = settings.announcement?.en ?? null;

  return (
    <>
      {announcement && (
        <div className="bg-ink-900 text-ink-100 px-4 py-2 text-center text-sm font-medium">
          {announcement}
        </div>
      )}
      <SiteHeader departments={departments} cartCount={cartCount} />
      {children}
      <SiteFooter socialLinks={settings.socialLinks} departments={departments} />
    </>
  );
}
