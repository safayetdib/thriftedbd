"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

/**
 * Search bar component for product search.
 * Client-side: submits to /products?q=query
 */
export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const t = useTranslations("products");
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      router.push("/products");
      return;
    }
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Nike search pill: soft-cloud fill, 24px radius, turns white on focus. */}
      <div className="bg-soft-cloud focus-within:border-ink-900 flex items-center rounded-md border border-transparent transition-colors focus-within:bg-white">
        <button type="submit" aria-label={t("search")} className="text-ink-900 pl-4">
          <MagnifyingGlassIcon size={20} />
        </button>
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-body-md placeholder:text-mute flex-1 border-none bg-transparent px-3 py-2.5 outline-none"
        />
      </div>
    </form>
  );
}
