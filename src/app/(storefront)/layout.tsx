import { connectDB } from "@/lib/db";
import { getActiveCategories } from "@/lib/services/category.service";
import { getCart } from "@/lib/services/cart.service";
import { getPublicSettings } from "@/lib/services/settings.service";
import { peekCartIdentity } from "@/lib/cart-identity";
import type { ICartItem } from "@/models/Cart";
import { SiteHeader } from "@/components/storefront/header";
import { SiteFooter } from "@/components/storefront/footer";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  await connectDB();
  const identity = await peekCartIdentity();
  const [categories, cart, settings] = await Promise.all([
    getActiveCategories(),
    identity ? getCart(identity) : null,
    getPublicSettings(),
  ]);

  const departments = categories
    .filter((c) => c.level === 0)
    .map((c) => ({ slug: c.slug, name: c.name.en }));

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
      <SiteHeader categories={departments} cartCount={cartCount} />
      {children}
      <SiteFooter socialLinks={settings.socialLinks} />
    </>
  );
}
