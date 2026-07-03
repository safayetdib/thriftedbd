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
      className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("fullName")}</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">{t("address")}</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">{t("city")}</Label>
        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="method">{t("paymentMethod")}</Label>
        <select
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value as typeof method)}
          className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
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

      <div className="border-ink-200 border-t-2 pt-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="couponCode">{t("couponLabel")}</Label>
          <div className="flex gap-2">
            <Input
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder={t("couponPlaceholder")}
              disabled={!!coupon || validatingCoupon}
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
                  {t("tryDifferentCode")}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">
                  {t("couponApplied", { code: coupon.code })}
                </span>
                <button
                  type="button"
                  onClick={() => setCoupon(null)}
                  className="text-xs text-green-700 underline"
                >
                  {t("removeCoupon")}
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
        {submitting ? t("placingOrder") : t("placeOrder")}
      </Button>
    </form>
  );
}
