import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { connectDB } from "@/lib/db";
import { getActiveProducts } from "@/lib/services/product.service";
import { getActiveCategories } from "@/lib/services/category.service";
import { getSettings } from "@/lib/services/settings.service";
import { getActivePromotions } from "@/lib/services/promotion.service";
import Product from "@/models/Product";
import Category from "@/models/Category";
import type { IProduct } from "@/models/Product";
import type { ICategory } from "@/models/Category";
import type { IWhyBuyBlock } from "@/models/Settings";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { PromotionCard } from "@/components/storefront/promotion-card";

const HeroCarousel = dynamic(() =>
  import("@/components/storefront/hero-carousel").then((mod) => mod.HeroCarousel),
);
const FaqAccordion = dynamic(() =>
  import("@/components/storefront/faq-accordion").then((mod) => mod.FaqAccordion),
);

export default async function Home() {
  await connectDB();
  const locale = await getLocale();
  const t = await getTranslations("home");

  // Fetch all data in parallel
  const [settings, promotions, productsResult, _allCategories] = await Promise.all([
    getSettings(),
    getActivePromotions(["homepage"]),
    getActiveProducts({ page: 1, limit: 8 }),
    getActiveCategories(),
  ]);

  const newArrivals: IProduct[] = JSON.parse(JSON.stringify(productsResult.items));
  const serializedPromotions = JSON.parse(JSON.stringify(promotions));

  const homepage = settings.homepage ?? {};

  // Fetch featured products
  let featuredProducts: IProduct[] = [];
  if (homepage.featuredProductIds && homepage.featuredProductIds.length > 0) {
    const items = JSON.parse(
      JSON.stringify(
        await Product.find({
          _id: { $in: homepage.featuredProductIds },
          status: "ACTIVE",
        }).lean(),
      ),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    featuredProducts = (homepage.featuredProductIds as any[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((id: any) => items.find((p: any) => p._id === id.toString()))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any): p is IProduct => !!p);
  }

  // Fetch featured categories
  let featuredCategories: ICategory[] = [];
  if (homepage.featuredCategoryIds && homepage.featuredCategoryIds.length > 0) {
    const items = await Category.find({
      _id: { $in: homepage.featuredCategoryIds },
      isActive: true,
    }).lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    featuredCategories = (homepage.featuredCategoryIds as any[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((id: any) => items.find((c: any) => c._id.toString() === id.toString()))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((c: any): c is ICategory => !!c);
  }

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero carousel */}
      {homepage.heroSlides && homepage.heroSlides.length > 0 ? (
        <HeroCarousel slides={homepage.heroSlides} />
      ) : (
        <section className="bg-ink-900 relative flex min-h-[420px] flex-col justify-center px-4 py-20 md:min-h-[560px] md:px-8">
          <div className="max-w-container mx-auto w-full">
            <p className="text-eyebrow text-amber-400">{t("eyebrow")}</p>
            <h1
              className="text-ink-50 mt-4 max-w-xl font-sans font-extrabold"
              style={{ fontSize: "clamp(2.25rem, 6vw, 3.5rem)", lineHeight: 1.05 }}
            >
              {t("heroTitle")}
            </h1>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products">
                <Button variant="primary" size="lg">
                  {t("shopNow")}
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-ink-300 text-ink-50 bg-transparent hover:bg-white/10"
                >
                  {t("exploreNewIn")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured categories */}
      {featuredCategories.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <h2 className="text-ink-900 mb-6 text-2xl font-extrabold">{t("featuredCategories")}</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link key={category._id.toString()} href={`/products?category=${category.slug}`}>
                <div className="border-ink-900 hover:bg-ink-50 flex flex-col items-center justify-center border-2 bg-white p-8 text-center transition-colors">
                  <h3 className="text-ink-900 font-bold">{localize(category.name, locale)}</h3>
                  <p className="text-ink-500 text-xs">{t("shopNow")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-ink-900 text-2xl font-extrabold">{t("newArrivals")}</h2>
            <Link href="/products" className="text-sm font-semibold text-green-600 hover:underline">
              {t("viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {newArrivals.map((product, i) => (
              <ProductCard key={String(product._id)} product={product} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* Offers section */}
      {serializedPromotions.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <h2 className="text-ink-900 mb-6 text-2xl font-extrabold">{t("specialOffers")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {serializedPromotions
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((p: any) => p.type === "section")
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((promo: any) => (
                <PromotionCard key={promo._id} promotion={promo} />
              ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <h2 className="text-ink-900 mb-6 text-2xl font-extrabold">{t("featuredProducts")}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {featuredProducts.map((product: IProduct, i: number) => (
              <ProductCard key={String(product._id)} product={product} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* Why buy from us */}
      {homepage.whyBuyBlocks && homepage.whyBuyBlocks.length > 0 ? (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-24">
          <h2 className="text-ink-900 mb-12 text-2xl font-extrabold">{t("whyShop")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {homepage.whyBuyBlocks.map((block: IWhyBuyBlock, idx: number) => (
              <div key={idx} className="flex flex-col items-start gap-4">
                <span className="text-3xl text-green-600">{block.icon}</span>
                <h4 className="text-ink-900 text-lg font-semibold">
                  {localize(block.title, locale)}
                </h4>
                <p className="text-ink-500 text-sm">{localize(block.description, locale)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {homepage.faqs && homepage.faqs.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <h2 className="text-ink-900 mb-8 text-2xl font-extrabold">{t("faq")}</h2>
          <div className="max-w-2xl">
            <FaqAccordion faqs={homepage.faqs} />
          </div>
        </section>
      )}
    </main>
  );
}
