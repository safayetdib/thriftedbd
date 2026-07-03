import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import {
  ShieldCheckIcon,
  TruckIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getProductBySlug, getSimilarProducts } from "@/lib/services/product.service";
import { getActivePromotions } from "@/lib/services/promotion.service";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/storefront/product-card";

const ProductGallery = dynamic(() =>
  import("@/components/storefront/product-gallery").then((mod) => mod.ProductGallery),
);
const AddToCartButton = dynamic(() =>
  import("@/components/storefront/add-to-cart-button").then((mod) => mod.AddToCartButton),
);
const FavoriteButton = dynamic(() =>
  import("@/components/storefront/favorite-button").then((mod) => mod.FavoriteButton),
);
import { auth } from "@/lib/auth";
import Customer from "@/models/Customer";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import type { IProductSize } from "@/models/Product";

const BASE = "https://thriftedbd.com";

function sizeLabel(size: IProductSize) {
  if (size.type === "standard") return size.standard;
  if (size.type === "custom") return size.custom;
  if (size.type === "measurement" && size.measurements) {
    const { chest, length, sleeve, waist } = size.measurements;
    return [
      chest && `Chest ${chest}"`,
      length && `Length ${length}"`,
      sleeve && `Sleeve ${sleeve}"`,
      waist && `Waist ${waist}"`,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return undefined;
}

function sizeMeasurements(size: IProductSize) {
  if (size.type !== "measurement" || !size.measurements) return null;
  const { chest, length, sleeve, waist } = size.measurements;
  const items = [
    chest && { label: "Chest", value: `${chest}"` },
    length && { label: "Length", value: `${length}"` },
    sleeve && { label: "Sleeve", value: `${sleeve}"` },
    waist && { label: "Waist", value: `${waist}"` },
  ].filter((x): x is { label: string; value: string } => Boolean(x));
  return items.length > 0 ? items : null;
}

const itemConditionMap: Record<string, string> = {
  Excellent: "https://schema.org/LikeNewCondition",
  Good: "https://schema.org/GoodCondition",
  Fair: "https://schema.org/UsedCondition",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "ACTIVE") {
    return { title: "Product not found | thriftedBD" };
  }

  const size = sizeLabel(product.size);
  const title = `${product.title.en} – ${product.brand} | thriftedBD`;
  const description = [
    product.condition,
    "condition",
    product.brand,
    product.title.en,
    size ? `· Size ${size}` : null,
    `· ৳${product.price}`,
    "— preloved fashion at thriftedBD, delivered COD across Bangladesh.",
  ]
    .filter(Boolean)
    .join(" ");

  const ogImage = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/products/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage, alt: product.title.en }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  await connectDB();
  const locale = await getLocale();
  const t = await getTranslations("product");
  const tEnum = await getTranslations("enums");
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ACTIVE") notFound();

  const session = await auth();
  let isFavorited = false;
  if (session?.user?.id && session.user.role === "customer") {
    const customer = await Customer.findById(session.user.id).select("favoriteProductIds").lean();
    isFavorited =
      customer?.favoriteProductIds?.some((id: unknown) => String(id) === String(product._id)) ??
      false;
  }

  const [similarProducts, promotions] = await Promise.all([
    getSimilarProducts(String(product._id), String(product.categoryId), product.price),
    getActivePromotions(["pdp", "global"]),
  ]);
  const serializedSimilar = JSON.parse(JSON.stringify(similarProducts));

  const size = sizeLabel(product.size);
  const measurements = sizeMeasurements(product.size);
  const isOnSale = Boolean(product.compareAtPrice);
  const discountPercent = isOnSale
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title.en,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((img: { url: string }) => img.url),
    description:
      product.notes?.en ??
      `${product.condition} condition ${product.brand} ${product.categoryPath.en}.`,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "BDT",
      availability:
        product.status === "ACTIVE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: itemConditionMap[product.condition] ?? "https://schema.org/UsedCondition",
      url: `${BASE}/products/${product.slug}`,
      seller: { "@type": "Organization", name: "thriftedBD" },
    },
  };

  return (
    <main className="max-w-container mx-auto w-full px-4 py-6 md:px-8 md:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-ink-500 mb-6 flex items-center gap-2 text-sm">
        <Link href="/products">All Products</Link>
        {product.categoryPath?.en && (
          <>
            <span>/</span>
            <span>{product.categoryPath.en}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
        <ProductGallery images={product.images} alt={localize(product.title, locale)} />

        <div className="flex flex-col gap-5">
          {/* Brand + Title */}
          <div>
            <p className="text-eyebrow text-ink-500">{product.brand}</p>
            <h1 className="text-ink-900 mt-1 text-2xl font-extrabold md:text-3xl">
              {localize(product.title, locale)}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <p className="text-price text-ink-900 text-3xl font-extrabold">৳{product.price}</p>
            {isOnSale && (
              <>
                <p className="text-price text-ink-400 text-lg line-through">
                  ৳{product.compareAtPrice}
                </p>
                <span className="bg-sale-500 rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          <div className="bg-ink-200 h-px" />

          {/* Size */}
          {size && (
            <div>
              <p className="text-eyebrow text-ink-500 mb-1.5">Size</p>
              <span className="border-ink-900 inline-block border-2 px-3 py-1 text-sm font-bold">
                {size}
              </span>
              {measurements && (
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                  {measurements.map((m) => (
                    <div key={m.label} className="flex items-baseline gap-1.5">
                      <span className="text-ink-500 text-xs">{m.label}</span>
                      <span className="text-ink-900 text-sm font-semibold">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Condition */}
          <div>
            <p className="text-eyebrow text-ink-500 mb-1.5">Condition</p>
            <Badge variant="imported">{tEnum(`condition.${product.condition}`)}</Badge>
          </div>

          {/* Description */}
          {localize(product.notes, locale) && (
            <p className="text-ink-600 text-sm leading-relaxed">
              {localize(product.notes, locale)}
            </p>
          )}

          <div className="bg-ink-200 h-px" />

          {/* CTA */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <AddToCartButton productId={String(product._id)} />
            </div>
            <FavoriteButton productId={String(product._id)} initialFavorited={isFavorited} />
          </div>

          {/* Trust signals */}
          <div className="border-ink-200 grid grid-cols-1 gap-3 border-t-2 pt-4 sm:grid-cols-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheckIcon size={18} className="shrink-0 text-green-600" />
              <p className="text-ink-700 text-xs font-semibold">{t("qualityChecked")}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <TruckIcon size={18} className="shrink-0 text-green-600" />
              <p className="text-ink-700 text-xs font-semibold">{t("codPayment")}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <ArrowCounterClockwiseIcon size={18} className="shrink-0 text-green-600" />
              <p className="text-ink-700 text-xs font-semibold">{t("nationwideDelivery")}</p>
            </div>
          </div>
        </div>
      </div>

      {promotions.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-ink-900 text-lg font-extrabold">{t("specialOffers")}</h2>
          <div className="flex flex-col gap-3">
            {promotions.map((promo) => (
              <div
                key={String(promo._id)}
                className="border-ink-900 border-2 p-4"
                style={{ backgroundColor: promo.backgroundColor || "#000" }}
              >
                <h3 className="font-bold text-white">
                  {localize(promo.headline, locale) || promo.title}
                </h3>
                {localize(promo.body, locale) && (
                  <p className="mt-1 text-sm text-white">{localize(promo.body, locale)}</p>
                )}
                {promo.ctaLink && localize(promo.ctaText, locale) && (
                  <a
                    href={promo.ctaLink}
                    className="mt-2 inline-block text-sm text-white underline"
                  >
                    {localize(promo.ctaText, locale)} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {serializedSimilar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-ink-900 mb-6 text-lg font-extrabold">{t("similarProducts")}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {serializedSimilar
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((prod: any) => (
                <ProductCard key={String(prod._id)} product={prod} />
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
