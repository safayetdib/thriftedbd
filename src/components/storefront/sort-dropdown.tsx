"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

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
  const t = useTranslations("products.sort");
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
      className="border-hairline hover:border-ink-900 text-caption-md rounded-pill text-ink-900 border bg-white px-4 py-2 transition-colors"
    >
      <option value="newest">{t("newest")}</option>
      <option value="price-asc">{t("priceAsc")}</option>
      <option value="price-desc">{t("priceDesc")}</option>
      <option value="sale-first">{t("saleFirst")}</option>
    </select>
  );
}
