import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { getActiveProducts } from "@/lib/services/product.service";
import { getActiveCategories } from "@/lib/services/category.service";
import Color from "@/models/Color";
import { ProductCard } from "@/components/storefront/product-card";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/storefront/search-bar";
import { FilterSidebar } from "@/components/storefront/filter-sidebar";
import { SortDropdown } from "@/components/storefront/sort-dropdown";

const BASE = "https://thriftedbd.com";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;

  if (params.q) {
    return {
      title: `Search: ${params.q} | thriftedBD`,
      description: `Search results for "${params.q}" — quality-checked preloved fashion.`,
      robots: { index: false },
    };
  }

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
  searchParams: Promise<{
    category?: string;
    page?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    sizes?: string;
    conditions?: string;
    colors?: string;
    brands?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  await connectDB();
  const categories = await getActiveCategories();
  const colors = await Color.find({ isActive: true }).lean();
  const activeCategory = params.category
    ? categories.find((c) => c.slug === params.category)
    : undefined;

  // Parse filter params
  const sizes = params.sizes ? params.sizes.split(",") : [];
  const conditions = params.conditions ? params.conditions.split(",") : [];
  const colorIds = params.colors ? params.colors.split(",") : [];
  const brands = params.brands ? params.brands.split(",") : [];
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const { items, total, limit } = await getActiveProducts({
    page,
    limit: 24,
    categoryId: activeCategory ? String(activeCategory._id) : undefined,
    search: params.q,
    minPrice,
    maxPrice,
    sizes,
    conditions,
    colorIds,
    brands,
    sort: (params.sort as "newest" | "price-asc" | "price-desc" | "sale-first") || "newest",
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

      {/* Search bar */}
      <div className="mb-8">
        <SearchBar initialQuery={params.q} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-ink-900 text-2xl font-extrabold">
            {params.q
              ? `Search: "${params.q}"`
              : activeCategory
                ? activeCategory.name.en
                : "All products"}
          </h1>
          <p className="text-ink-500 text-sm">{total} item(s)</p>
        </div>
      </div>

      {/* Category pills */}
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

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <FilterSidebar
          categories={categories}
          colors={colors}
          activeCategory={activeCategory}
          currentParams={params}
        />

        {/* Main content */}
        <div className="flex-1">
          {/* Sort dropdown */}
          <div className="mb-4 flex justify-end">
            <SortDropdown currentSort={params.sort} currentParams={params} />
          </div>

          {items.length === 0 ? (
            <p className="text-ink-500 py-16 text-center">
              No products found matching your criteria.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={String(product._id)} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const queryParams = new URLSearchParams(params as Record<string, string>);
                queryParams.set("page", String(p));
                return (
                  <Link
                    key={p}
                    href={`/products?${queryParams.toString()}`}
                    className={cn(
                      "border-ink-900 border-2 px-3 py-1.5 text-xs font-bold",
                      p === page ? "bg-ink-900 text-white" : "hover:bg-ink-100 bg-white",
                    )}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
