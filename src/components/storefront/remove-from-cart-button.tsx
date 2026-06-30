"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function RemoveFromCartButton({ productId }: { productId: string }) {
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
      aria-label="Remove from cart"
    >
      <XIcon size={16} />
    </Button>
  );
}
