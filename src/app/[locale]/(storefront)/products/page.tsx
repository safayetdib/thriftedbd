import { Pagination } from "@/components/storefront/pagination";
import { ProductCard } from "@/components/storefront/product-card";
import { SearchBar } from "@/components/storefront/search-bar";
import { SortDropdown } from "@/components/storefront/sort-dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/i18n/navigation";
import { connectDB } from "@/lib/db";
import { localize } from "@/lib/localize";
import { getActiveCategories } from "@/lib/services/category.service";
import { serialize } from "@/lib/serialize";
import { getActiveProducts, getAvailableSizes } from "@/lib/services/product.service";
import { cn } from "@/lib/utils";
import type { ICategory } from "@/models/Category";
import type { IColor } from "@/models/Color";
import Color from "@/models/Color";
import type { IProduct } from "@/models/Product";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";

const FilterSidebar = dynamic(() =>
  import("@/components/storefront/filter-sidebar").then((mod) => mod.FilterSidebar),
);
const MobileFilters = dynamic(() =>
  import("@/components/storefront/filter-sidebar").then((mod) => mod.MobileFilters),
);

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
      description: `Search results for "${params.q}" - quality-checked preloved fashion.`,
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
      description: `Browse ${catName} - quality-checked preloved fashion imported from Korea, Japan, Taiwan & China. Cash on delivery across Bangladesh.`,
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
  const categories = serialize<ICategory[]>(await getActiveCategories());
  const colors = serialize<IColor[]>(await Color.find({ isActive: true }).lean());
  const availableSizes = await getAvailableSizes();
  const activeCategory = params.category
    ? categories.find((c) => c.slug === params.category)
    : undefined;

  const sizes = params.sizes ? params.sizes.split(",") : [];
  const conditions = params.conditions ? params.conditions.split(",") : [];
  const colorIds = params.colors ? params.colors.split(",") : [];
  const brands = params.brands ? params.brands.split(",") : [];
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const {
    items: rawItems,
    total,
    limit,
  } = await getActiveProducts({
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
    // Keep sold items visible (shown as "Sold") so the catalogue reflects real sales.
    includeSold: true,
  });
  const items = serialize<IProduct[]>(rawItems);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const departments = categories.filter((c) => c.level === 0);

  // The department to highlight = the active category itself (if a department)
  // or its parent (if a subcategory is active), plus that department's children.
  const activeDept =
    activeCategory?.level === 0
      ? activeCategory
      : activeCategory
        ? categories.find((c) => String(c._id) === String(activeCategory.parentId))
        : undefined;
  const subcategories = activeDept
    ? categories.filter((c) => c.level > 0 && String(c.parentId) === String(activeDept._id))
    : [];

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
        <h1 className="text-heading-xl text-ink-900">
          {params.q
            ? t("searchHeading", { query: params.q })
            : activeCategory
              ? localize(activeCategory.name, locale)
              : t("allProducts")}
        </h1>
        <p className="text-body-sm text-mute mt-0.5">{t("itemCount", { count: total })}</p>
      </div>

      {/* Category pills */}
      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        <Link
          href="/products"
          className={cn(
            "text-caption-md rounded-pill border px-4 py-1.5 transition-colors",
            !activeCategory
              ? "border-ink-900 bg-ink-900 text-white"
              : "border-hairline text-ink-900 hover:bg-soft-cloud bg-white",
          )}
        >
          {t("all")}
        </Link>
        {departments.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className={cn(
              "text-caption-md rounded-pill border px-4 py-1.5 transition-colors",
              activeDept?.slug === c.slug
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-hairline text-ink-900 hover:bg-soft-cloud bg-white",
            )}
          >
            {localize(c.name, locale)}
          </Link>
        ))}
      </div>

      {/* Subcategory pills - shown when the active department has children. */}
      {subcategories.length > 0 && activeDept && (
        <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
          <Link
            href={`/products?category=${activeDept.slug}`}
            className={cn(
              "text-caption-sm rounded-pill border px-3 py-1 transition-colors",
              activeCategory?.slug === activeDept.slug
                ? "border-ink-900 text-ink-900"
                : "border-hairline text-mute hover:text-ink-900 bg-white",
            )}
          >
            All {localize(activeDept.name, locale)}
          </Link>
          {subcategories.map((s) => (
            <Link
              key={s.slug}
              href={`/products?category=${s.slug}`}
              className={cn(
                "text-caption-sm rounded-pill border px-3 py-1 transition-colors",
                activeCategory?.slug === s.slug
                  ? "border-ink-900 text-ink-900"
                  : "border-hairline text-mute hover:text-ink-900 bg-white",
              )}
            >
              {localize(s.name, locale)}
            </Link>
          ))}
        </div>
      )}

      {/* Product area: sidebar + grid */}
      <div className="flex gap-4 md:gap-6">
        <FilterSidebar
          categories={categories}
          colors={colors}
          sizes={availableSizes}
          activeCategory={activeCategory}
          currentParams={params}
        />

        <div className="min-w-0 flex-1">
          {/* Toolbar: mobile filter trigger (left, hidden at md+) + sort (right) */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <MobileFilters
              categories={categories}
              colors={colors}
              sizes={availableSizes}
              activeCategory={activeCategory}
              currentParams={params}
            />
            <div className="ml-auto">
              <SortDropdown currentSort={params.sort} currentParams={params} />
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyState icon={<MagnifyingGlassIcon size={32} />} title={t("noResults")} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
