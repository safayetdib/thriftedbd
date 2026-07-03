"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { cn } from "@/lib/utils";
import type { IColor } from "@/models/Color";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FunnelSimpleIcon } from "@phosphor-icons/react";

interface FilterSidebarProps {
  categories: unknown[];
  colors: IColor[];
  activeCategory?: unknown;
  currentParams: Record<string, string | undefined>;
}

function countActiveFilters(params: Record<string, string | undefined>) {
  let count = 0;
  if (params.sizes) count += params.sizes.split(",").length;
  if (params.conditions) count += params.conditions.split(",").length;
  if (params.colors) count += params.colors.split(",").length;
  if (params.minPrice || params.maxPrice) count += 1;
  if (params.brands) count += 1;
  return count;
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const conditions = ["Excellent", "Good", "Fair"];

function FilterContent({
  colors,
  currentParams,
  onFilterChange,
  onClearAll,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  handlePriceBlur,
}: {
  colors: IColor[];
  currentParams: Record<string, string | undefined>;
  onFilterChange: (key: string, values: string[]) => void;
  onClearAll: () => void;
  minPrice: string;
  maxPrice: string;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  handlePriceBlur: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("filters");
  const tEnum = useTranslations("enums");

  const currentSizes = currentParams.sizes ? currentParams.sizes.split(",") : [];
  const currentConditions = currentParams.conditions ? currentParams.conditions.split(",") : [];
  const currentColors = currentParams.colors ? currentParams.colors.split(",") : [];

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className={cn("text-eyebrow text-ink-700 font-bold")}>Filters</h3>
        <button
          onClick={onClearAll}
          className="text-xs font-semibold text-green-700 hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="bg-ink-200 h-px" />

      {/* Price range */}
      <div>
        <h3 className="text-eyebrow text-ink-700 mb-3 font-bold">{t("priceRange")}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={handlePriceBlur}
            onKeyDown={(e) => e.key === "Enter" && handlePriceBlur()}
            className="border-ink-900 w-full border-2 px-2 py-1.5 text-xs font-semibold outline-none"
          />
          <span className="text-ink-400 text-xs">—</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={handlePriceBlur}
            onKeyDown={(e) => e.key === "Enter" && handlePriceBlur()}
            className="border-ink-900 w-full border-2 px-2 py-1.5 text-xs font-semibold outline-none"
          />
        </div>
        {(currentParams.minPrice || currentParams.maxPrice) && (
          <button
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              onFilterChange("price", []);
            }}
            className="mt-1.5 text-xs font-semibold text-green-700 hover:underline"
          >
            {t("clear")}
          </button>
        )}
      </div>

      <div className="bg-ink-200 h-px" />

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
                onFilterChange("sizes", newSizes);
              }}
              className={cn(
                "border-ink-900 border-2 px-2 py-1 text-xs font-bold transition-colors",
                currentSizes.includes(size)
                  ? "bg-ink-900 text-white"
                  : "text-ink-900 hover:bg-ink-100 bg-white",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ink-200 h-px" />

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
                  onFilterChange("conditions", newConditions);
                }}
                className="border-ink-900 h-4 w-4 border-2"
              />
              <span className="text-ink-700 text-sm font-medium">{tEnum(`condition.${cond}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-ink-200 h-px" />

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-eyebrow text-ink-700 mb-3 font-bold">{t("color")}</h3>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {colors.map((color) => (
              <label key={color._id.toString()} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentColors.includes(color._id.toString())}
                  onChange={(e) => {
                    const newColors = e.target.checked
                      ? [...currentColors, color._id.toString()]
                      : currentColors.filter((c) => c !== color._id.toString());
                    onFilterChange("colors", newColors);
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
    </>
  );
}

export function FilterSidebar({ colors, currentParams }: FilterSidebarProps) {
  const router = useRouter();

  const [minPrice, setMinPrice] = useState(currentParams.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(currentParams.maxPrice ?? "");

  const handleFilterChange = (key: string, values: string[]) => {
    const params = new URLSearchParams(currentParams as Record<string, string>);
    if (key === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else if (values.length === 0) {
      params.delete(key);
    } else {
      params.set(key, values.join(","));
    }
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceBlur = () => {
    const params = new URLSearchParams(currentParams as Record<string, string>);
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  const handleClearAll = () => {
    router.push("/products");
  };

  const activeCount = countActiveFilters(currentParams);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="border-ink-900 sticky top-24 flex flex-col gap-5 border-2 bg-white p-5">
          <FilterContent
            colors={colors}
            currentParams={currentParams}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            handlePriceBlur={handlePriceBlur}
          />
        </div>
      </aside>

      {/* Mobile filter button */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <button className="border-ink-900 hover:bg-ink-100 flex items-center gap-2 border-2 bg-white px-3 py-2 text-sm font-bold transition-colors">
                <FunnelSimpleIcon size={16} weight="bold" />
                Filters
                {activeCount > 0 && (
                  <span className="bg-ink-900 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white">
                    {activeCount}
                  </span>
                )}
              </button>
            }
          />
          <SheetContent side="left" className="w-72">
            <SheetHeader className="mb-2">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-5 overflow-y-auto pr-2">
              <FilterContent
                colors={colors}
                currentParams={currentParams}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                minPrice={minPrice}
                maxPrice={maxPrice}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                handlePriceBlur={handlePriceBlur}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
