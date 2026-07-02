import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheckIcon,
  TruckIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getProductBySlug, getSimilarProducts } from "@/lib/services/product.service";
import { getActivePromotions } from "@/lib/services/promotion.service";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { FavoriteButton } from "@/components/storefront/favorite-button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import Customer from "@/models/Customer";
import Link from "next/link";
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
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ACTIVE") notFound();

  // Check if customer has this product favorited
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

  const size = sizeLabel(product.size);

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
    <main className="max-w-container mx-auto w-full px-4 py-8 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} alt={product.title.en} />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-eyebrow text-ink-500">{product.brand}</p>
            <h1 className="text-ink-900 mt-1 text-2xl font-extrabold">{product.title.en}</h1>
          </div>

          <p className="text-price text-ink-900 text-2xl font-extrabold">
            {product.compareAtPrice ? (
              <>
                <span className="text-sale-500">৳{product.price}</span>{" "}
                <span className="text-ink-400 text-lg line-through">৳{product.compareAtPrice}</span>
              </>
            ) : (
              <>৳{product.price}</>
            )}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="imported">{product.condition}</Badge>
            {size && <Badge variant="imported">{size}</Badge>}
          </div>

          {product.notes?.en && <p className="text-ink-600 text-sm">{product.notes.en}</p>}

          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1">
              <AddToCartButton productId={String(product._id)} />
            </div>
            <FavoriteButton productId={String(product._id)} initialFavorited={isFavorited} />
          </div>

          <div className="border-ink-200 mt-4 grid grid-cols-1 gap-4 border-t-2 pt-4 sm:grid-cols-3">
            <div className="flex flex-col items-start gap-1.5">
              <ShieldCheckIcon size={20} className="text-green-600" />
              <p className="text-ink-900 text-xs font-semibold">Quality checked</p>
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <TruckIcon size={20} className="text-green-600" />
              <p className="text-ink-900 text-xs font-semibold">COD + bKash/Nagad</p>
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <ArrowCounterClockwiseIcon size={20} className="text-green-600" />
              <p className="text-ink-900 text-xs font-semibold">Nationwide delivery</p>
            </div>
          </div>
        </div>
      </div>

      {promotions.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-ink-900 text-lg font-extrabold">Special offers</h2>
          <div className="flex flex-col gap-3">
            {promotions.map((promo) => (
              <div
                key={String(promo._id)}
                className="border-ink-900 border-2 p-4"
                style={{ backgroundColor: promo.backgroundColor || "#000" }}
              >
                <h3 className="font-bold text-white">{promo.headline?.en || promo.title}</h3>
                {promo.body?.en && <p className="mt-1 text-sm text-white">{promo.body.en}</p>}
                {promo.ctaLink && promo.ctaText?.en && (
                  <a
                    href={promo.ctaLink}
                    className="mt-2 inline-block text-sm text-white underline"
                  >
                    {promo.ctaText.en} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {similarProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-ink-900 mb-6 text-lg font-extrabold">Similar products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {similarProducts.map((prod) => (
              <Link key={String(prod._id)} href={`/products/${prod.slug}`}>
                <div className="border-ink-900 hover:bg-ink-50 flex flex-col gap-2 border-2 p-3 transition-colors">
                  <div className="border-ink-900 bg-ink-100 relative aspect-square overflow-hidden border-2">
                    {prod.images[0] && (
                      <Image
                        src={prod.images[0].url}
                        alt={prod.title.en}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="text-ink-900 line-clamp-2 text-sm font-semibold">{prod.title.en}</p>
                  <p className="text-price text-ink-900 font-bold">৳{prod.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
