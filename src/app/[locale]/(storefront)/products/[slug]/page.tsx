import { ProductCard } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { localize } from "@/lib/localize";
import { serialize } from "@/lib/serialize";
import { getProductBySlug, getSimilarProducts } from "@/lib/services/product.service";
import { getActivePromotions } from "@/lib/services/promotion.service";
import Customer from "@/models/Customer";
import type { IProduct, IProductSize } from "@/models/Product";
import {
  ArrowCounterClockwiseIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

const ProductGallery = dynamic(() =>
  import("@/components/storefront/product-gallery").then((mod) => mod.ProductGallery),
);
const AddToCartButton = dynamic(() =>
  import("@/components/storefront/add-to-cart-button").then((mod) => mod.AddToCartButton),
);
const FavoriteButton = dynamic(() =>
  import("@/components/storefront/favorite-button").then((mod) => mod.FavoriteButton),
);

const BASE = "https://thriftedbd.com";

function sizeLabel(size: IProductSize | undefined) {
  if (!size) return undefined;
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

function sizeMeasurements(size: IProductSize | undefined) {
  if (!size || size.type !== "measurement" || !size.measurements) return null;
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

  if (!product || (product.status !== "ACTIVE" && product.status !== "SOLD")) {
    return { title: "Product not found | thriftedBD" };
  }

  const size = sizeLabel(product.size);
  const title = `${product.title.en}${product.brand ? ` – ${product.brand}` : ""} | thriftedBD`;
  const description = [
    product.condition,
    "condition",
    product.brand,
    product.title.en,
    size ? `· Size ${size}` : null,
    `· ৳${product.price}`,
    "- preloved fashion at thriftedBD, delivered COD across Bangladesh.",
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
  if (!product || (product.status !== "ACTIVE" && product.status !== "SOLD")) notFound();
  const isSold = product.status === "SOLD";

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
  const serializedSimilar = serialize<IProduct[]>(similarProducts);

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
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    image: product.images.map((img: { url: string }) => img.url),
    description:
      product.description?.en ??
      product.notes?.en ??
      `${product.condition} condition ${product.brand ? `${product.brand} ` : ""}${product.categoryPath.en}.`,
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

      <div className="text-caption-md text-mute mb-6 flex items-center gap-2">
        <Link href="/products" prefetch={false}>
          All Products
        </Link>
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
            {isSold && (
              <span className="mb-2 inline-block">
                <Badge variant="sold">{t("sold")}</Badge>
              </span>
            )}
            {product.brand && (
              <p className="text-eyebrow text-caption-sm text-mute">{product.brand}</p>
            )}
            <h1 className="text-heading-xl text-ink-900 mt-1">{localize(product.title, locale)}</h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <p
              className={`text-price text-3xl font-medium ${isOnSale ? "text-sale-500" : "text-ink-900"}`}
            >
              ৳{product.price}
            </p>
            {isOnSale && (
              <>
                <p className="text-price text-mute text-lg line-through">
                  ৳{product.compareAtPrice}
                </p>
                <span className="text-price text-caption-md text-sale-500">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          <div className="bg-hairline-soft h-px" />

          {/* Size */}
          {size && (
            <div>
              <p className="text-eyebrow text-caption-sm text-mute mb-1.5">Size</p>
              <span className="border-hairline text-caption-md rounded-pill inline-block border px-3 py-1">
                {size}
              </span>
              {measurements && (
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                  {measurements.map((m) => (
                    <div key={m.label} className="flex items-baseline gap-1.5">
                      <span className="text-caption-sm text-mute">{m.label}</span>
                      <span className="text-caption-md text-ink-900">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Condition */}
          <div>
            <p className="text-eyebrow text-caption-sm text-mute mb-1.5">Condition</p>
            <Badge variant="imported">{tEnum(`condition.${product.condition}`)}</Badge>
          </div>

          {/* Color */}
          {localize(product.color, locale) && (
            <div>
              <p className="text-eyebrow text-caption-sm text-mute mb-1.5">Color</p>
              <span className="border-hairline text-caption-md rounded-pill inline-block border px-3 py-1">
                {localize(product.color, locale)}
              </span>
            </div>
          )}

          {/* Description - customer-facing write-up (internal notes are never shown). */}
          {localize(product.description, locale) && (
            <p className="text-body-sm text-charcoal leading-relaxed whitespace-pre-line">
              {localize(product.description, locale)}
            </p>
          )}

          <div className="bg-hairline-soft h-px" />

          {/* CTA - a sold item stays on the page but can't be added to bag. */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              {isSold ? (
                <Button variant="secondary" size="lg" disabled className="w-full">
                  {t("sold")}
                </Button>
              ) : (
                <AddToCartButton productId={String(product._id)} />
              )}
            </div>
            <FavoriteButton productId={String(product._id)} initialFavorited={isFavorited} />
          </div>

          {/* Trust signals */}
          <div className="border-hairline-soft grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheckIcon size={18} className="text-ink-900 shrink-0" />
              <p className="text-caption-sm text-charcoal">{t("qualityChecked")}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <TruckIcon size={18} className="text-ink-900 shrink-0" />
              <p className="text-caption-sm text-charcoal">{t("codPayment")}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <ArrowCounterClockwiseIcon size={18} className="text-ink-900 shrink-0" />
              <p className="text-caption-sm text-charcoal">{t("nationwideDelivery")}</p>
            </div>
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

      {serializedSimilar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-heading-lg text-ink-900 mb-6">{t("similarProducts")}</h2>
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
