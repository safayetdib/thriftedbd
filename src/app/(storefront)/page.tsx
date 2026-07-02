import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { FaqAccordion } from "@/components/storefront/faq-accordion";
import { PromotionCard } from "@/components/storefront/promotion-card";

export default async function Home() {
  await connectDB();

  // Fetch all data in parallel
  const [settings, promotions, productsResult, _allCategories] = await Promise.all([
    getSettings(),
    getActivePromotions(["homepage"]),
    getActiveProducts({ page: 1, limit: 8 }),
    getActiveCategories(),
  ]);

  const newArrivals: IProduct[] = productsResult.items;

  const homepage = settings.homepage ?? {};

  // Fetch featured products
  let featuredProducts: IProduct[] = [];
  if (homepage.featuredProductIds && homepage.featuredProductIds.length > 0) {
    const items = await Product.find({
      _id: { $in: homepage.featuredProductIds },
      status: "ACTIVE",
    }).lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    featuredProducts = (homepage.featuredProductIds as any[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((id: any) => items.find((p: any) => p._id.toString() === id.toString()))
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
            <p className="text-eyebrow text-amber-400">Imported preloved fashion</p>
            <h1
              className="text-ink-50 mt-4 max-w-xl font-sans font-extrabold"
              style={{ fontSize: "clamp(2.25rem, 6vw, 3.5rem)", lineHeight: 1.05 }}
            >
              Quality secondhand, sourced from Korea, Japan, Taiwan &amp; China.
            </h1>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products">
                <Button variant="primary" size="lg">
                  Shop now
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-ink-300 text-ink-50 bg-transparent hover:bg-white/10"
                >
                  Explore new in
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured categories */}
      {featuredCategories.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <h2 className="text-ink-900 mb-6 text-2xl font-extrabold">Featured categories</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link key={category._id.toString()} href={`/products?category=${category.slug}`}>
                <div className="border-ink-900 hover:bg-ink-50 flex flex-col items-center justify-center border-2 bg-white p-8 text-center transition-colors">
                  <h3 className="text-ink-900 font-bold">{category.name.en}</h3>
                  <p className="text-ink-500 text-xs">Shop now</p>
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
            <h2 className="text-ink-900 text-2xl font-extrabold">New arrivals</h2>
            <Link href="/products" className="text-sm font-semibold text-green-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={String(product._id)} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Offers section */}
      {promotions.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <h2 className="text-ink-900 mb-6 text-2xl font-extrabold">Special offers</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {promotions
              .filter((p) => p.type === "section")
              .map((promo) => (
                <PromotionCard key={promo._id.toString()} promotion={promo} />
              ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <h2 className="text-ink-900 mb-6 text-2xl font-extrabold">Featured products</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {featuredProducts.map((product: IProduct) => (
              <ProductCard key={String(product._id)} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Why buy from us */}
      {homepage.whyBuyBlocks && homepage.whyBuyBlocks.length > 0 ? (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-24">
          <h2 className="text-ink-900 mb-12 text-2xl font-extrabold">Why shop with us?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {homepage.whyBuyBlocks.map((block: IWhyBuyBlock, idx: number) => (
              <div key={idx} className="flex flex-col items-start gap-4">
                <span className="text-3xl text-green-600">{block.icon}</span>
                <h4 className="text-ink-900 text-lg font-semibold">{block.title?.en}</h4>
                <p className="text-ink-500 text-sm">{block.description?.en}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {homepage.faqs && homepage.faqs.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <h2 className="text-ink-900 mb-8 text-2xl font-extrabold">Frequently asked</h2>
          <div className="max-w-2xl">
            <FaqAccordion faqs={homepage.faqs} />
          </div>
        </section>
      )}
    </main>
  );
}
