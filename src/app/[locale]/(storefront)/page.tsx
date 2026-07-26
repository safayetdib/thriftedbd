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
import type { IWhyBuyBlock, IHeroSlide } from "@/models/Settings";
import dynamic from "next/dynamic";
import { ProductCard } from "@/components/storefront/product-card";
import { PromotionCard } from "@/components/storefront/promotion-card";

const HeroCarousel = dynamic(() =>
  import("@/components/storefront/hero-carousel").then((mod) => mod.HeroCarousel),
);
const FaqAccordion = dynamic(() =>
  import("@/components/storefront/faq-accordion").then((mod) => mod.FaqAccordion),
);

/**
 * Default hero slides — the in-repo banner photos (public/banners) paired with
 * category-relevant copy. Used when the admin hasn't configured hero slides in
 * Settings; if any CMS slides exist, those take over entirely. `imageKey` is
 * only meaningful for R2-managed uploads, so it's blank for these static files.
 */
const FALLBACK_HERO_SLIDES: IHeroSlide[] = [
  {
    imageUrl: "/banners/banner_guy_girl.jpeg",
    imageKey: "",
    headline: "Preloved, not less loved",
    subheadline:
      "Quality-checked imported thrift from Korea, Japan, Taiwan & China — delivered cash-on-delivery across Bangladesh.",
    ctaText: "Shop new in",
    ctaLink: "/products",
    order: 0,
    enabled: true,
  },
  {
    imageUrl: "/banners/banner_bags.jpeg",
    imageKey: "",
    headline: "Bags with a past",
    subheadline: "Totes, crossbodies and backpacks — one-of-a-kind thrifted finds, ready to carry.",
    ctaText: "Shop bags",
    ctaLink: "/products",
    order: 1,
    enabled: true,
  },
  {
    imageUrl: "/banners/banner_girl_tops.jpeg",
    imageKey: "",
    headline: "Tops that tell a story",
    subheadline:
      "Blouses, tees and knits for her — unique preloved pieces, freshly dropped every week.",
    ctaText: "Shop women's tops",
    ctaLink: "/products",
    order: 2,
    enabled: true,
  },
  {
    imageUrl: "/banners/banner_gents_tops.jpeg",
    imageKey: "",
    headline: "Sharp. Secondhand. Sorted.",
    subheadline: "Shirts and tees for him — imported thrift, quality-checked and priced to move.",
    ctaText: "Shop men's tops",
    ctaLink: "/products",
    order: 3,
    enabled: true,
  },
  {
    imageUrl: "/banners/banner_palazzo.jpeg",
    imageKey: "",
    headline: "Flow into palazzo season",
    subheadline: "Breezy wide-leg palazzos — thrifted, one-of-a-kind and made for Dhaka days.",
    ctaText: "Shop palazzos",
    ctaLink: "/products",
    order: 4,
    enabled: true,
  },
];

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
      {/* Hero carousel — admin-configured slides if any, otherwise the default
          banner set (public/banners) with category-relevant copy. */}
      <HeroCarousel
        slides={
          homepage.heroSlides && homepage.heroSlides.length > 0
            ? homepage.heroSlides
            : FALLBACK_HERO_SLIDES
        }
      />

      {/* Featured categories */}
      {featuredCategories.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <h2 className="text-heading-lg text-ink-900 mb-6">{t("featuredCategories")}</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link key={category._id.toString()} href={`/products?category=${category.slug}`}>
                <div className="border-hairline hover:bg-soft-cloud flex flex-col items-center justify-center rounded-none border bg-white p-8 text-center transition-colors">
                  <h3 className="text-body-strong text-ink-900">
                    {localize(category.name, locale)}
                  </h3>
                  <p className="text-caption-sm text-mute">{t("shopNow")}</p>
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
            <h2 className="text-heading-lg text-ink-900">{t("newArrivals")}</h2>
            <Link href="/products" className="text-caption-md text-ink-900 hover:underline">
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
          <h2 className="text-heading-lg text-ink-900 mb-6">{t("specialOffers")}</h2>
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
          <h2 className="text-heading-lg text-ink-900 mb-6">{t("featuredProducts")}</h2>
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
          <h2 className="text-heading-lg text-ink-900 mb-12">{t("whyShop")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {homepage.whyBuyBlocks.map((block: IWhyBuyBlock, idx: number) => (
              <div key={idx} className="flex flex-col items-start gap-4">
                <span className="text-ink-900 text-3xl">{block.icon}</span>
                <h4 className="text-heading-md text-ink-900">{localize(block.title, locale)}</h4>
                <p className="text-body-sm text-mute">{localize(block.description, locale)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {homepage.faqs && homepage.faqs.length > 0 && (
        <section className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
          <h2 className="text-heading-lg text-ink-900 mb-8">{t("faq")}</h2>
          <div className="max-w-2xl">
            <FaqAccordion faqs={homepage.faqs} />
          </div>
        </section>
      )}
    </main>
  );
}
