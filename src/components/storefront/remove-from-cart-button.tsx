"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function RemoveFromCartButton({ productId }: { productId: string }) {
  const t = useTranslations("cart");
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    await fetch(`/api/cart/items/${productId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleRemove}
      disabled={removing}
      aria-label={t("remove")}
    >
      <XIcon size={16} />
    </Button>
  );
}
