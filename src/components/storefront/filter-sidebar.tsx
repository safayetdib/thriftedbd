"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import type { IColor } from "@/models/Color";

interface FilterSidebarProps {
  categories: unknown[];
  colors: IColor[];
  activeCategory?: unknown;
  currentParams: Record<string, string | undefined>;
}

/**
 * Filter sidebar for product list.
 * Allows filtering by price, size, condition, color, brand.
 * Updates URL params on change.
 */
export function FilterSidebar({ colors, currentParams }: FilterSidebarProps) {
  const locale = useLocale();
  const t = useTranslations("filters");
  const tEnum = useTranslations("enums");
  const router = useRouter();

  const handleFilterChange = (key: string, values: string[]) => {
    const params = new URLSearchParams(currentParams as Record<string, string>);
    if (values.length === 0) {
      params.delete(key);
    } else {
      params.set(key, values.join(","));
    }
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const conditions = ["Excellent", "Good", "Fair"];
  const currentSizes = currentParams.sizes ? currentParams.sizes.split(",") : [];
  const currentConditions = currentParams.conditions ? currentParams.conditions.split(",") : [];
  const currentColors = currentParams.colors ? currentParams.colors.split(",") : [];

  return (
    <aside className="hidden w-48 shrink-0 md:block">
      <div className="border-ink-900 flex flex-col gap-6 border-2 bg-white p-4">
        {/* Price range */}
        <div>
          <h3 className="text-eyebrow text-ink-700 mb-3 font-bold">{t("priceRange")}</h3>
          <div className="text-ink-600 text-xs">
            <p className="mb-2">
              {currentParams.minPrice && currentParams.maxPrice
                ? `৳${currentParams.minPrice} - ৳${currentParams.maxPrice}`
                : currentParams.minPrice
                  ? `৳${currentParams.minPrice}+`
                  : currentParams.maxPrice
                    ? t("upTo", { max: currentParams.maxPrice })
                    : t("anyPrice")}
            </p>
            <button
              onClick={() => {
                const params = new URLSearchParams(currentParams as Record<string, string>);
                params.delete("minPrice");
                params.delete("maxPrice");
                router.push(`/products?${params.toString()}`);
              }}
              className="text-xs font-semibold text-green-700 hover:underline"
            >
              {t("clear")}
            </button>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h3 className="text-eyebrow text-ink-700 mb-3 font-bold">{t("size")}</h3>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  const newSizes = currentSizes.includes(size)
                    ? currentSizes.filter((s) => s !== size)
                    : [...currentSizes, size];
                  handleFilterChange("sizes", newSizes);
                }}
                className={`border-ink-900 border-2 px-2 py-1 text-xs font-bold transition-colors ${
                  currentSizes.includes(size)
                    ? "bg-ink-900 text-white"
                    : "text-ink-900 hover:bg-ink-100 bg-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div>
          <h3 className="text-eyebrow text-ink-700 mb-3 font-bold">{t("condition")}</h3>
          <div className="space-y-2">
            {conditions.map((cond) => (
              <label key={cond} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentConditions.includes(cond)}
                  onChange={(e) => {
                    const newConditions = e.target.checked
                      ? [...currentConditions, cond]
                      : currentConditions.filter((c) => c !== cond);
                    handleFilterChange("conditions", newConditions);
                  }}
                  className="border-ink-900 h-4 w-4 border-2"
                />
                <span className="text-ink-700 text-sm font-medium">
                  {tEnum(`condition.${cond}`)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div>
            <h3 className="text-eyebrow text-ink-700 mb-3 font-bold">{t("color")}</h3>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {colors.map((color) => (
                <label
                  key={color._id.toString()}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={currentColors.includes(color._id.toString())}
                    onChange={(e) => {
                      const newColors = e.target.checked
                        ? [...currentColors, color._id.toString()]
                        : currentColors.filter((c) => c !== color._id.toString());
                      handleFilterChange("colors", newColors);
                    }}
                    className="border-ink-900 h-4 w-4 border-2"
                  />
                  <span className="text-ink-700 text-sm font-medium">
                    {localize(color.name, locale)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
