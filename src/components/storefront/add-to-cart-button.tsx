"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ productId }: { productId: string }) {
  const t = useTranslations("product");
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? t("addError"));
      setState("added");
      router.refresh();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : t("addError"));
    }
  }

  if (state === "added") {
    return (
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" disabled className="flex-1">
          {t("addedToBag")}
        </Button>
        <Link href="/cart">
          <Button variant="outline" size="lg">
            {t("viewBag")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="primary"
        size="lg"
        onClick={handleAdd}
        disabled={state === "loading"}
        className="w-full"
      >
        {state === "loading" ? t("adding") : t("addToBag")}
      </Button>
      {error && <p className="text-sale-500 text-sm font-medium">{error}</p>}
    </div>
  );
}
