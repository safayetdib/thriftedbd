"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { Badge } from "@/components/ui/badge";
import { ShoppingBagIcon, ArrowRightIcon } from "@phosphor-icons/react";

export type ProductCardData = {
  slug: string;
  title: { en: string; bn?: string };
  brand: string;
  price: number;
  compareAtPrice?: number;
  images: { url: string }[];
  size: { type: "standard" | "measurement" | "custom"; standard?: string; custom?: string };
  status: "DRAFT" | "ACTIVE" | "SOLD" | "ARCHIVED";
};

function sizeLabel(size: ProductCardData["size"]) {
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
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-xl bg-white"
    >
      <div className="bg-ink-100 relative aspect-3/4 overflow-hidden">
        {product.images[0]?.url && (
          <Image
            src={product.images[0].url}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            priority={priority}
            className={`object-cover transition-transform duration-300 ${isSold ? "grayscale" : "group-hover:scale-[1.05]"}`}
          />
        )}
        {isSold && (
          <span className="absolute top-3 left-3">
            <Badge variant="sold">{t("sold")}</Badge>
          </span>
        )}
        {!isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/15">
            <span className="flex translate-y-3 items-center gap-2 rounded-full bg-white px-5 py-2.5 opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              <ShoppingBagIcon size={16} className="text-ink-900" />
              <ArrowRightIcon size={14} className="text-ink-900" />
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="mb-1 flex items-center gap-1.5">
          <p className="text-body-sm-strong truncate text-green-700">{product.brand}</p>
          {size && (
            <>
              <span className="text-ink-300 shrink-0">·</span>
              <p className="text-caption text-ink-500 truncate">{size}</p>
            </>
          )}
        </div>
        <p className="text-body-md text-ink-900 mb-3 truncate font-semibold">{title}</p>
        <div className="flex items-center justify-between">
          <p className="text-price text-body-md-strong text-ink-900">
            {product.compareAtPrice ? (
              <>
                <span className="text-sale-500">৳{product.price}</span>{" "}
                <span className="text-ink-400 line-through">৳{product.compareAtPrice}</span>
              </>
            ) : (
              <>৳{product.price}</>
            )}
          </p>
          <span className="text-ink-400 flex items-center transition-colors group-hover:text-green-700">
            <ArrowRightIcon size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
