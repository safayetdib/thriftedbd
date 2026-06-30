"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CouponState = {
  code: string;
  discountAmount: number;
  error?: string;
};

export function CheckoutForm({ subtotal }: { subtotal: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [method, setMethod] = useState<"COD" | "bKash" | "Nagad">("COD");
  const [transactionRef, setTransactionRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<CouponState | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  async function handleValidateCoupon() {
    if (!couponCode.trim()) {
      setCoupon({ code: "", discountAmount: 0, error: "Enter a coupon code" });
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderSubtotal: subtotal }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCoupon({
          code: couponCode,
          discountAmount: 0,
          error: json.error?.message || "Invalid coupon",
        });
      } else {
        const data = json.data;
        if (data.valid) {
          setCoupon({
            code: data.code,
            discountAmount: data.discountAmount,
          });
          setCouponCode("");
        } else {
          setCoupon({ code: couponCode, discountAmount: 0, error: data.error || "Invalid coupon" });
        }
      }
    } catch (_err) {
      setCoupon({ code: couponCode, discountAmount: 0, error: "Failed to validate coupon" });
    } finally {
      setValidatingCoupon(false);
    }
  }

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
          couponCode: coupon?.code || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to place order");
      router.push(`/order-success/${json.data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
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

      <div className="border-ink-200 border-t-2 pt-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="couponCode">Coupon code (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              disabled={!!coupon || validatingCoupon}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleValidateCoupon}
              disabled={!couponCode.trim() || validatingCoupon || !!coupon}
            >
              {validatingCoupon ? "..." : "Apply"}
            </Button>
          </div>
        </div>

        {coupon && (
          <div
            className={`mt-3 border-2 p-2 ${coupon.error ? "border-sale-500 bg-sale-50" : "border-green-600 bg-green-50"}`}
          >
            {coupon.error ? (
              <>
                <p className="text-sale-700 text-sm font-medium">{coupon.error}</p>
                <button
                  type="button"
                  onClick={() => setCoupon(null)}
                  className="text-sale-700 mt-1 text-xs underline"
                >
                  Try different code
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">
                  Coupon {coupon.code} applied
                </span>
                <button
                  type="button"
                  onClick={() => setCoupon(null)}
                  className="text-xs text-green-700 underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
