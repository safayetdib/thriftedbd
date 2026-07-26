"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRouter } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { cn } from "@/lib/utils";
import type { IColor } from "@/models/Color";
import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

interface FilterSidebarProps {
  categories: unknown[];
  colors: IColor[];
  sizes: string[];
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

const conditions = ["Excellent", "Good", "Fair"];

function FilterContent({
  colors,
  sizes,
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
  sizes: string[];
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
        <h3 className={cn("text-heading-md text-ink-900")}>Filters</h3>
        <button onClick={onClearAll} className="text-caption-md text-mute hover:text-ink-900">
          Clear all
        </button>
      </div>

      <div className="bg-hairline h-px" />

      {/* Price range */}
      <div>
        <h3 className="text-heading-md text-ink-900 mb-3">{t("priceRange")}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={handlePriceBlur}
            onKeyDown={(e) => e.key === "Enter" && handlePriceBlur()}
            className="bg-soft-cloud text-caption-md placeholder:text-mute focus:border-ink-900 w-full rounded-md border border-transparent px-4 py-2 outline-none focus:bg-white"
          />
          <span className="text-mute text-caption-md">-</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={handlePriceBlur}
            onKeyDown={(e) => e.key === "Enter" && handlePriceBlur()}
            className="bg-soft-cloud text-caption-md placeholder:text-mute focus:border-ink-900 w-full rounded-md border border-transparent px-4 py-2 outline-none focus:bg-white"
          />
        </div>
        {(currentParams.minPrice || currentParams.maxPrice) && (
          <button
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              onFilterChange("price", []);
            }}
            className="text-caption-md text-mute hover:text-ink-900 mt-2"
          >
            {t("clear")}
          </button>
        )}
      </div>

      {/* Sizes - Nike filter chips: white pill, ink fill when active. Only shown
          when the catalog has sizes; the list is built from real products so
          custom sizes (e.g. `H 19" W 10"`) appear alongside S/M/L. */}
      {sizes.length > 0 && (
        <>
          <div className="bg-hairline h-px" />
          <div>
            <h3 className="text-heading-md text-ink-900 mb-3">{t("size")}</h3>
            <div className="flex flex-wrap gap-2">
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
                    "text-caption-sm rounded-pill px-4 py-2 transition-colors",
                    currentSizes.includes(size)
                      ? "bg-ink-900 text-white"
                      : "border-hairline text-ink-900 hover:border-ink-900 border bg-white",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="bg-hairline h-px" />

      {/* Condition */}
      <div>
        <h3 className="text-heading-md text-ink-900 mb-3">{t("condition")}</h3>
        <div className="space-y-2">
          {conditions.map((cond) => (
            <label key={cond} className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={currentConditions.includes(cond)}
                onCheckedChange={(checked) => {
                  const newConditions = checked
                    ? [...currentConditions, cond]
                    : currentConditions.filter((c) => c !== cond);
                  onFilterChange("conditions", newConditions);
                }}
              />
              <span className="text-body-sm text-charcoal">{tEnum(`condition.${cond}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-hairline h-px" />

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-heading-md text-ink-900 mb-3">{t("color")}</h3>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {colors.map((color) => (
              <label
                key={color._id.toString()}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <Checkbox
                  checked={currentColors.includes(color._id.toString())}
                  onCheckedChange={(checked) => {
                    const newColors = checked
                      ? [...currentColors, color._id.toString()]
                      : currentColors.filter((c) => c !== color._id.toString());
                    onFilterChange("colors", newColors);
                  }}
                />
                <span className="text-body-sm text-charcoal">{localize(color.name, locale)}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/** URL-param filter state + handlers, shared by the desktop rail and mobile sheet.
 * Both instances stay in sync because the source of truth is the query string. */
function useFilterState(currentParams: Record<string, string | undefined>) {
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

  return {
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    handleFilterChange,
    handlePriceBlur,
    handleClearAll,
  };
}

export function FilterSidebar({ colors, sizes, currentParams }: FilterSidebarProps) {
  const state = useFilterState(currentParams);

  return (
    // Desktop sidebar
    // Nike's PLP rail is a plain ~220px column - no container border, no card.
    <aside className="hidden w-[220px] shrink-0 md:block">
      <div className="sticky top-24 flex flex-col gap-6 bg-white">
        <FilterContent
          colors={colors}
          sizes={sizes}
          currentParams={currentParams}
          onFilterChange={state.handleFilterChange}
          onClearAll={state.handleClearAll}
          minPrice={state.minPrice}
          maxPrice={state.maxPrice}
          setMinPrice={state.setMinPrice}
          setMaxPrice={state.setMaxPrice}
          handlePriceBlur={state.handlePriceBlur}
        />
      </div>
    </aside>
  );
}

/** Mobile filter trigger + sheet. Rendered in the PLP toolbar row - NOT inside
 * the sidebar+grid flex row, where it would reserve a column and squeeze the
 * product grid on small screens. */
export function MobileFilters({ colors, sizes, currentParams }: FilterSidebarProps) {
  const state = useFilterState(currentParams);
  const activeCount = countActiveFilters(currentParams);

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <button className="border-hairline hover:border-ink-900 text-caption-md rounded-pill text-ink-900 flex items-center gap-2 border bg-white px-4 py-2 transition-colors">
              <FunnelSimpleIcon size={16} />
              Filters
              {activeCount > 0 && (
                <span className="bg-ink-900 text-caption-sm flex size-5 items-center justify-center rounded-full text-white">
                  {activeCount}
                </span>
              )}
            </button>
          }
        />
        <SheetContent side="left" className="w-72 max-w-[85vw]">
          <SheetHeader className="mb-2">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 overflow-y-auto pr-2">
            <FilterContent
              colors={colors}
              sizes={sizes}
              currentParams={currentParams}
              onFilterChange={state.handleFilterChange}
              onClearAll={state.handleClearAll}
              minPrice={state.minPrice}
              maxPrice={state.maxPrice}
              setMinPrice={state.setMinPrice}
              setMaxPrice={state.setMaxPrice}
              handlePriceBlur={state.handlePriceBlur}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
