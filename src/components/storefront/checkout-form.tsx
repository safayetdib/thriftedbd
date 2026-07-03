"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CouponState = {
  code: string;
  discountAmount: number;
  error?: string;
};

const BD_CITIES = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Barisal",
  "Rangpur",
  "Mymensingh",
  "Other",
];

export function CheckoutForm({ subtotal }: { subtotal: number }) {
  const t = useTranslations("checkout");
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
      setCoupon({ code: "", discountAmount: 0, error: t("couponEmpty") });
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
          error: json.error?.message || t("couponInvalid"),
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
          setCoupon({
            code: couponCode,
            discountAmount: 0,
            error: data.error || t("couponInvalid"),
          });
        }
      }
    } catch (_err) {
      setCoupon({ code: couponCode, discountAmount: 0, error: t("couponValidateFailed") });
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
      if (!res.ok) throw new Error(json.error?.message ?? t("placeOrderFailed"));
      router.push(`/order-success/${json.data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("placeOrderFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-ink-900 flex flex-col gap-6 border-2 bg-white p-5 md:p-6"
    >
      {/* Customer section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-eyebrow text-ink-500">Contact</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("fullName")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>
      </div>

      <div className="bg-ink-200 h-px" />

      {/* Delivery section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-eyebrow text-ink-500">Delivery</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">{t("address")}</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">{t("city")}</Label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border-ink-900 h-11 w-full border-2 bg-white px-4 text-sm outline-none focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2"
          >
            {BD_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-ink-200 h-px" />

      {/* Payment section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-eyebrow text-ink-500">Payment</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="method">{t("paymentMethod")}</Label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
            className="border-ink-900 h-11 w-full border-2 bg-white px-4 text-sm outline-none focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2"
          >
            <option value="COD">{t("cod")}</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
          </select>
        </div>
        {method !== "COD" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="transactionRef">{t("transactionId", { method })}</Label>
            <Input
              id="transactionRef"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder={t("transactionIdPlaceholder")}
            />
          </div>
        )}
      </div>

      <div className="bg-ink-200 h-px" />

      {/* Coupon section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-eyebrow text-ink-500">{t("couponLabel")}</h2>
        <div className="flex gap-2">
          <Input
            id="couponCode"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder={t("couponPlaceholder")}
            disabled={!!coupon || validatingCoupon}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleValidateCoupon}
            disabled={!couponCode.trim() || validatingCoupon || !!coupon}
          >
            {validatingCoupon ? "..." : t("apply")}
          </Button>
        </div>

        {coupon && (
          <div
            aria-live="polite"
            className={`flex items-center justify-between border-2 p-3 ${
              coupon.error ? "border-sale-500 bg-sale-50" : "border-green-600 bg-green-50"
            }`}
          >
            {coupon.error ? (
              <>
                <p role="alert" className="text-sm font-medium text-white">
                  {coupon.error}
                </p>
                <button
                  type="button"
                  onClick={() => setCoupon(null)}
                  className="shrink-0 text-sm font-medium text-white underline"
                >
                  {t("tryDifferentCode")}
                </button>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-green-700">
                  {t("couponApplied", { code: coupon.code })}
                </span>
                <button
                  type="button"
                  onClick={() => setCoupon(null)}
                  className="text-sm font-medium text-green-700 underline"
                >
                  {t("removeCoupon")}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="border-sale-500 bg-sale-50 border-2 px-3 py-2 text-sm font-medium text-white"
        >
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" loading={submitting}>
        {t("placeOrder")}
      </Button>
    </form>
  );
}
