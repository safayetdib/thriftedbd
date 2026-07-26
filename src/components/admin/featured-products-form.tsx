"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XIcon } from "@phosphor-icons/react";

type Product = { _id: string; title: string };

export function FeaturedProductsForm({
  allProducts,
  initialFeaturedIds,
}: {
  allProducts: Product[];
  initialFeaturedIds: string[];
}) {
  const router = useRouter();
  const [featuredIds, setFeaturedIds] = useState<string[]>(initialFeaturedIds);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = allProducts.filter(
    (p) => !featuredIds.includes(p._id) && p.title.toLowerCase().includes(search.toLowerCase()),
  );
  const featuredProducts = allProducts.filter((p) => featuredIds.includes(p._id));

  function addProduct(id: string) {
    if (featuredIds.length >= 10) {
      setError("Maximum 10 products allowed");
      return;
    }
    setFeaturedIds([...featuredIds, id]);
    setSearch("");
    setError(null);
  }

  function removeProduct(id: string) {
    setFeaturedIds(featuredIds.filter((fid) => fid !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homepage: { featuredProductIds: featuredIds },
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message ?? "Failed to update");
      }

      router.push("/admin/homepage");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <p
          role="alert"
          className="border-sale-500 bg-sale-50 text-sale-700 text-body-sm rounded-none border px-4 py-3"
        >
          {error}
        </p>
      )}

      {/* Featured list */}
      <div className="border-hairline rounded-none border bg-white p-5">
        <h2 className="text-eyebrow text-caption-sm text-mute mb-4">
          Featured ({featuredIds.length}/10)
        </h2>
        <div className="space-y-2">
          {featuredProducts.length === 0 ? (
            <p className="text-mute text-body-sm">No products selected yet.</p>
          ) : (
            featuredProducts.map((p, idx) => (
              <div
                key={p._id}
                className="border-hairline-soft flex items-center justify-between rounded-none border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-mute text-caption-sm">{idx + 1}</span>
                  <span className="text-ink-900">{p.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(p._id)}
                  className="text-mute hover:text-sale-500"
                  aria-label="Remove"
                >
                  <XIcon size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Search and add */}
      <div className="border-hairline rounded-none border bg-white p-5">
        <h2 className="text-eyebrow text-caption-sm text-mute mb-4">Add products</h2>
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="text-ink-900 bg-soft-cloud placeholder:text-mute focus:border-ink-900 flex-1 rounded-md border border-transparent px-6 py-3 text-sm transition-colors outline-none focus:bg-white"
          />
        </div>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <p className="text-mute text-body-sm p-3">
              {search
                ? "No products match your search."
                : "All products already featured or none available."}
            </p>
          ) : (
            filteredProducts.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => addProduct(p._id)}
                className="border-hairline-soft hover:border-ink-900 text-body-sm w-full rounded-none border p-2 text-left transition-colors"
              >
                {p.title}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/homepage")}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
