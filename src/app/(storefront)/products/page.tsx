import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { getActiveProducts } from "@/lib/services/product.service";
import { getActiveCategories } from "@/lib/services/category.service";
import { ProductCard } from "@/components/storefront/product-card";
import { cn } from "@/lib/utils";

const BASE = "https://thriftedbd.com";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;

  if (params.category) {
    await connectDB();
    const categories = await getActiveCategories();
    const cat = categories.find((c) => c.slug === params.category);
    const catName = cat?.name.en ?? params.category;
    return {
      title: `${catName} | thriftedBD`,
      description: `Browse ${catName} — quality-checked preloved fashion imported from Korea, Japan, Taiwan & China. Cash on delivery across Bangladesh.`,
      alternates: { canonical: `${BASE}/products?category=${params.category}` },
    };
  }

  return {
    title: "All Products | thriftedBD",
    description:
      "Browse quality-checked preloved fashion imported from Korea, Japan, Taiwan & China. COD + bKash/Nagad accepted across Bangladesh.",
    alternates: { canonical: `${BASE}/products` },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  await connectDB();
  const categories = await getActiveCategories();
  const activeCategory = params.category
    ? categories.find((c) => c.slug === params.category)
    : undefined;

  const { items, total, limit } = await getActiveProducts({
    page,
    limit: 24,
    categoryId: activeCategory ? String(activeCategory._id) : undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const departments = categories.filter((c) => c.level === 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: activeCategory ? activeCategory.name.en : "All Products",
    url: `${BASE}/products${activeCategory ? `?category=${activeCategory.slug}` : ""}`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: (page - 1) * limit + i + 1,
      url: `${BASE}/products/${item.slug}`,
      name: item.title.en,
    })),
  };

  return (
    <main className="max-w-container mx-auto w-full px-4 py-8 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-ink-900 text-2xl font-extrabold">
            {activeCategory ? activeCategory.name.en : "All products"}
          </h1>
          <p className="text-ink-500 text-sm">{total} item(s)</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={cn(
            "border-ink-900 border-2 px-3 py-1.5 text-xs font-bold tracking-wide uppercase",
            !activeCategory ? "bg-ink-900 text-white" : "text-ink-900 hover:bg-ink-100 bg-white",
          )}
        >
          All
        </Link>
        {departments.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className={cn(
              "border-ink-900 border-2 px-3 py-1.5 text-xs font-bold tracking-wide uppercase",
              activeCategory?.slug === c.slug
                ? "bg-ink-900 text-white"
                : "text-ink-900 hover:bg-ink-100 bg-white",
            )}
          >
            {c.name.en}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-ink-500 py-16 text-center">No products found in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={String(product._id)} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/products?${activeCategory ? `category=${activeCategory.slug}&` : ""}page=${p}`}
              className={cn(
                "border-ink-900 border-2 px-3 py-1.5 text-xs font-bold",
                p === page ? "bg-ink-900 text-white" : "hover:bg-ink-100 bg-white",
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
