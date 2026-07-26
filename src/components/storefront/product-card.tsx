"use client";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

export type ProductCardData = {
  slug: string;
  title: { en: string; bn?: string };
  brand?: string;
  price: number;
  compareAtPrice?: number;
  images: { url: string }[];
  size?: { type: "standard" | "measurement" | "custom"; standard?: string; custom?: string };
  status: "DRAFT" | "ACTIVE" | "SOLD" | "ARCHIVED";
};

function sizeLabel(size: ProductCardData["size"]) {
  if (!size) return undefined;
  if (size.type === "standard") return size.standard;
  if (size.type === "custom") return size.custom;
  return undefined;
}

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("product");
  const isSold = product.status === "SOLD";
  const size = sizeLabel(product.size);
  const title = localize(product.title, locale);

  return (
    <Link href={`/products/${product.slug}`} className="group block rounded-none bg-white">
      {/*
        The photograph *is* the card: zero radius, zero padding, no shadow, no
        border. Soft cloud stages the image so inconsistent self-shot thrift
        photos share a common backdrop. DESIGN.md → Components → product-card.
      */}
      <div className="bg-soft-cloud relative aspect-3/4 overflow-hidden rounded-none">
        {product.images[0]?.url && (
          <Image
            src={product.images[0].url}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            priority={priority}
            className={`object-cover ${isSold ? "grayscale" : ""}`}
          />
        )}
        {isSold && (
          <span className="absolute top-3 left-3">
            <Badge variant="sold">{t("sold")}</Badge>
          </span>
        )}
      </div>
      {/* Metadata sits flush under the image on an 8px rhythm - no card padding. */}
      <div className="flex flex-col gap-2 pt-3">
        <p className="text-body-strong text-ink-900 truncate group-hover:underline">{title}</p>
        {(product.brand || size) && (
          <div className="flex items-center gap-1.5">
            {product.brand && <p className="text-caption-md text-mute truncate">{product.brand}</p>}
            {product.brand && size && <span className="text-hairline shrink-0">·</span>}
            {size && <p className="text-caption-md text-mute truncate">{size}</p>}
          </div>
        )}
        {/* Sale is the only non-neutral in retail chrome: red price + struck original. */}
        <p className="text-price text-body-strong text-ink-900">
          {product.compareAtPrice ? (
            <>
              <span className="text-sale-500">৳{product.price}</span>{" "}
              <span className="text-mute line-through">৳{product.compareAtPrice}</span>
            </>
          ) : (
            <>৳{product.price}</>
          )}
        </p>
      </div>
    </Link>
  );
}
