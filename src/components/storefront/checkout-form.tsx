"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PlacedOrder = {
  orderNumber: string;
  total: number;
  shippingFee: number;
};

export function CheckoutForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [method, setMethod] = useState<"COD" | "bKash" | "Nagad">("COD");
  const [transactionRef, setTransactionRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, address, city },
          payment: { method, transactionRef: transactionRef || undefined },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to place order");
      setPlacedOrder({
        orderNumber: json.data.orderNumber,
        total: json.data.total,
        shippingFee: json.data.shippingFee,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  if (placedOrder) {
    return (
      <div className="border-ink-900 flex flex-col items-center gap-4 border-2 bg-white p-8 text-center">
        <h1 className="text-ink-900 text-2xl font-extrabold">Order placed!</h1>
        <p className="text-ink-600">
          Order <span className="text-ink-900 font-semibold">{placedOrder.orderNumber}</span> ·
          Total ৳{placedOrder.total} (incl. ৳{placedOrder.shippingFee} delivery)
        </p>
        <p className="text-ink-500 text-sm">We&apos;ll call {phone} to confirm before dispatch.</p>
        <Link href="/products">
          <Button variant="primary">Continue shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">City</Label>
        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="method">Payment method</Label>
        <select
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value as typeof method)}
          className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
        >
          <option value="COD">Cash on delivery</option>
          <option value="bKash">bKash</option>
          <option value="Nagad">Nagad</option>
        </select>
      </div>
      {method !== "COD" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="transactionRef">{method} transaction ID</Label>
          <Input
            id="transactionRef"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="After sending money, paste the TrxID here"
          />
        </div>
      )}
      {error && (
        <p className="border-sale-500 bg-sale-50 text-sale-700 border-2 px-3 py-2 text-sm font-medium">
          {error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={submitting}>
        {submitting ? "Placing order…" : "Place order"}
      </Button>
    </form>
  );
}
