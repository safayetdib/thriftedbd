import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export type ProductCardData = {
  slug: string;
  title: { en: string };
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

export function ProductCard({ product }: { product: ProductCardData }) {
  const isSold = product.status === "SOLD";
  const size = sizeLabel(product.size);

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="border-ink-900 bg-ink-100 relative aspect-3/4 border-2">
        {product.images[0]?.url && (
          <Image
            src={product.images[0].url}
            alt={product.title.en}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={`object-cover transition-transform duration-200 ${isSold ? "grayscale" : "group-hover:scale-[1.03]"}`}
          />
        )}
        {isSold && (
          <span className="absolute top-2 left-2">
            <Badge variant="sold">Sold</Badge>
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-0.5">
        <p className="text-ink-900 truncate text-sm font-semibold">{product.brand}</p>
        <p className="text-ink-600 truncate text-sm">{product.title.en}</p>
        {size && <p className="text-ink-500 text-xs">{size}</p>}
        <p className="text-price text-ink-900 mt-0.5 font-semibold">
          {product.compareAtPrice ? (
            <>
              <span className="text-sale-500">৳{product.price}</span>{" "}
              <span className="text-ink-400 line-through">৳{product.compareAtPrice}</span>
            </>
          ) : (
            <>৳{product.price}</>
          )}
        </p>
      </div>
    </Link>
  );
}
