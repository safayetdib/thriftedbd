"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackOrderAction } from "./actions";

/**
 * Public order tracking page.
 * Customers enter phone + orderNumber to find their order.
 * No login required.
 */
export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const orderNumber = searchParams.get("orderNumber");

  const [error, formAction, isPending] = useActionState(trackOrderAction, undefined);

  return (
    <main className="bg-ink-50 flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="border-ink-900 shadow-brutal-md w-full max-w-md border-2 bg-white p-8">
        <p className="text-eyebrow text-green-700">thriftedBD</p>
        <h1 className="text-ink-900 mt-1 text-2xl font-extrabold">Track order</h1>
        <p className="text-ink-600 mt-1 text-sm">Enter your details to find your order</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={phone || ""}
              placeholder="+880 1234 567 890"
              required
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="orderNumber">Order number</Label>
            <Input
              id="orderNumber"
              name="orderNumber"
              type="text"
              defaultValue={orderNumber || ""}
              placeholder="ORD-ABC123"
              required
              disabled={isPending}
            />
          </div>

          {error && (
            <p className="border-sale-500 bg-sale-50 text-sale-700 border-2 px-3 py-2 text-sm font-medium">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="mt-2 w-full" disabled={isPending}>
            {isPending ? "Searching…" : "Track order"}
          </Button>
        </form>

        <div className="text-ink-600 mt-6 text-center text-sm">
          <Link href="/" className="text-ink-900 font-semibold underline hover:no-underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
