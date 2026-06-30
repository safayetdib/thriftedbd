"use client";

import { useRouter } from "next/navigation";

/**
 * Sort dropdown for products.
 * Updates URL params when sort changes.
 */
export function SortDropdown({
  currentSort = "newest",
  currentParams,
}: {
  currentSort?: string;
  currentParams: Record<string, string | undefined>;
}) {
  const router = useRouter();

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(currentParams as Record<string, string>);
    if (sort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    params.set("page", "1"); // Reset to page 1 when sorting changes
    router.push(`/products?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSort(e.target.value)}
      className="border-ink-900 border-2 bg-white px-3 py-2 text-sm font-semibold"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="sale-first">Sale Items First</option>
    </select>
  );
}
