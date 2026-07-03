import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { connectDB } from "@/lib/db";
import { getActiveProducts } from "@/lib/services/product.service";
import { getActiveCategories } from "@/lib/services/category.service";
import Color from "@/models/Color";
import { ProductCard } from "@/components/storefront/product-card";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/storefront/search-bar";
import { FilterSidebar } from "@/components/storefront/filter-sidebar";
import { SortDropdown } from "@/components/storefront/sort-dropdown";
import { Pagination } from "@/components/storefront/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";

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
  const locale = await getLocale();
  const t = await getTranslations("products");
  const categories = await getActiveCategories();
  const colors = await Color.find({ isActive: true }).lean();
  const activeCategory = params.category
    ? categories.find((c) => c.slug === params.category)
    : undefined;

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
    name: activeCategory ? localize(activeCategory.name, locale) : "All Products",
    url: `${BASE}/products${activeCategory ? `?category=${activeCategory.slug}` : ""}`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: (page - 1) * limit + i + 1,
      url: `${BASE}/products/${item.slug}`,
      name: item.title.en,
    })),
  };

  return (
    <main className="max-w-container mx-auto w-full px-4 py-6 md:px-8 md:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Search bar */}
      <div className="mb-6">
        <SearchBar initialQuery={params.q} />
      </div>

      {/* Page header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-ink-900 text-2xl font-extrabold">
          {params.q
            ? t("searchHeading", { query: params.q })
            : activeCategory
              ? localize(activeCategory.name, locale)
              : t("allProducts")}
        </h1>
        <p className="text-ink-500 mt-0.5 text-sm">{t("itemCount", { count: total })}</p>
      </div>

      {/* Category pills */}
      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        <Link
          href="/products"
          className={cn(
            "border-ink-900 border-2 px-3 py-1.5 text-xs font-bold tracking-wide uppercase",
            !activeCategory ? "bg-ink-900 text-white" : "text-ink-900 hover:bg-ink-100 bg-white",
          )}
        >
          {t("all")}
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
            {localize(c.name, locale)}
          </Link>
        ))}
      </div>

      {/* Product area: sidebar + grid */}
      <div className="flex gap-4 md:gap-6">
        <FilterSidebar
          categories={categories}
          colors={colors}
          activeCategory={activeCategory}
          currentParams={params}
        />

        <div className="min-w-0 flex-1">
          {/* Sort dropdown (desktop) */}
          <div className="mb-4 flex items-center justify-end">
            <SortDropdown currentSort={params.sort} currentParams={params} />
          </div>

          {items.length === 0 ? (
            <EmptyState icon={<MagnifyingGlassIcon size={32} />} title={t("noResults")} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((product) => (
                  <ProductCard key={String(product._id)} product={product} />
                ))}
              </div>

              <Pagination currentPage={page} totalPages={totalPages} baseParams={params} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
