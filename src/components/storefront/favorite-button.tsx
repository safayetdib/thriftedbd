"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HeartIcon } from "@phosphor-icons/react";

export function FavoriteButton({
  productId,
  initialFavorited = false,
}: {
  productId: string;
  initialFavorited?: boolean;
}) {
  const t = useTranslations("product");
  const [isFav, setIsFav] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        window.location.href = "/login?callbackUrl=" + encodeURIComponent(window.location.pathname);
        return;
      }
      const json = await res.json();
      if (json.data) setIsFav(json.data.isFavorited);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={isFav ? t("removeFromFavorites") : t("addToFavorites")}
      className="border-ink-900 hover:bg-ink-100 flex h-9 w-9 items-center justify-center border-2 bg-white transition-colors disabled:opacity-50"
    >
      <HeartIcon
        size={18}
        weight={isFav ? "fill" : "regular"}
        className={isFav ? "text-sale-500" : "text-ink-700"}
      />
    </button>
  );
}
