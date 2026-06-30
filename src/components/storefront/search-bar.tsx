"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

/**
 * Search bar component for product search.
 * Client-side: submits to /products?q=query
 */
export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
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
          placeholder="Search products by name, brand, or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-none px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit"
          className="border-ink-900 text-ink-700 hover:bg-ink-50 border-l-2 p-3 transition-colors"
        >
          <MagnifyingGlassIcon size={20} />
        </button>
      </div>
    </form>
  );
}
