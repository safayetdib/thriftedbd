import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { getCart } from "@/lib/services/cart.service";
import { peekCartIdentity } from "@/lib/cart-identity";
import { getSettings } from "@/lib/services/settings.service";
import { getActivePromotions } from "@/lib/services/promotion.service";
import { getProductById } from "@/lib/services/product.service";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { RemoveFromCartButton } from "@/components/storefront/remove-from-cart-button";
import { ShoppingBagIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { ICartItem } from "@/models/Cart";
import type { IProduct } from "@/models/Product";

export default async function CartPage() {
  await connectDB();
  const locale = await getLocale();
  const t = await getTranslations("cart");
  const identity = await peekCartIdentity();
  const [cart, settings, promotions] = await Promise.all([
    identity ? getCart(identity) : null,
    getSettings(),
    getActivePromotions(["cart", "global"]),
  ]);
  const items: ICartItem[] = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let featuredProducts: IProduct[] = [];
  if (settings.homepage?.featuredProductIds && settings.homepage.featuredProductIds.length > 0) {
    const featuredIds = settings.homepage.featuredProductIds.slice(0, 4) as unknown[];
    const products = await Promise.all(
      featuredIds.map((id: unknown) => getProductById(String(id))),
    );
    featuredProducts = products.filter((p): p is IProduct => p !== null && p.status === "ACTIVE");
  }

  if (items.length === 0) {
    return (
      <main className="max-w-container mx-auto flex w-full flex-col items-center gap-5 px-4 py-24 text-center md:px-8">
        <ShoppingBagIcon size={40} className="text-stone" />
        <h1 className="text-heading-xl text-ink-900">{t("emptyTitle")}</h1>
        <p className="text-body-md text-mute max-w-sm">{t("emptyBlurb")}</p>
        <Link href="/products">
          <Button variant="primary" size="lg">
            {t("browseProducts")}
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-container mx-auto w-full px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-heading-xl text-ink-900 mb-6">
        {t("title")}
        <span className="text-mute ml-2 text-lg font-normal">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={String(item.productId)}
              className="border-hairline flex gap-4 rounded-none border bg-white p-3 md:gap-5 md:p-4"
            >
              <div className="bg-soft-cloud relative size-20 shrink-0 rounded-none md:size-24">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={localize(item.title, locale)}
                    fill
                    sizes="96px"
                    className="object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-body-strong text-ink-900 truncate">
                    {localize(item.title, locale)}
                  </p>
                  <RemoveFromCartButton productId={String(item.productId)} />
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <p className="text-price text-ink-900 text-lg font-medium">৳{item.price}</p>
                  <span className="border-hairline text-caption-sm rounded-pill inline-flex items-center gap-1 border px-2 py-0.5">
                    {t("qty", { count: item.quantity })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="border-hairline flex flex-col gap-4 rounded-none border bg-white p-5 md:p-6">
            <h2 className="text-eyebrow text-caption-sm text-mute">{t("orderSummary")}</h2>

            <div className="flex items-center justify-between">
              <span className="text-body-sm text-mute">
                Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
              <span className="text-price text-body-strong text-ink-900">৳{subtotal}</span>
            </div>

            <div className="bg-hairline-soft h-px" />

            <div>
              <p className="text-caption-sm text-mute leading-relaxed">
                {t("deliveryNote", {
                  inside: settings.deliveryFee.insideDhaka,
                  outside: settings.deliveryFee.outsideDhaka,
                })}
              </p>
            </div>

            <div className="bg-hairline-soft h-px" />

            <div className="flex items-center justify-between">
              <span className="text-caption-md text-ink-900">Total</span>
              <span className="text-price text-ink-900 text-xl font-medium">৳{subtotal}</span>
            </div>

            <Link href="/checkout" className="mt-1 block">
              <Button variant="primary" size="lg" className="w-full gap-2">
                {t("checkout")}
                <CaretRightIcon size={16} weight="bold" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {promotions.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-heading-lg text-ink-900">{t("specialOffers")}</h2>
          <div className="flex flex-col gap-3">
            {promotions.map((promo) => (
              <div
                key={String(promo._id)}
                className="rounded-none p-4"
                style={{ backgroundColor: promo.backgroundColor || "#000" }}
              >
                <h3 className="text-body-strong text-white">
                  {localize(promo.headline, locale) || promo.title}
                </h3>
                {localize(promo.body, locale) && (
                  <p className="text-body-sm mt-1 text-white">{localize(promo.body, locale)}</p>
                )}
                {promo.ctaLink && localize(promo.ctaText, locale) && (
                  <a
                    href={promo.ctaLink}
                    className="text-caption-md mt-2 inline-block text-white underline"
                  >
                    {localize(promo.ctaText, locale)} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-heading-lg text-ink-900 mb-6">{t("completeYourLook")}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={String(product._id)} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
