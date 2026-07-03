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
      <div className="border-ink-900 flex items-center border-2 bg-white">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-none px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit"
          aria-label={t("search")}
          className="border-ink-900 text-ink-700 hover:bg-ink-50 border-l-2 p-3 transition-colors"
        >
          <MagnifyingGlassIcon size={20} />
        </button>
      </div>
    </form>
  );
}
