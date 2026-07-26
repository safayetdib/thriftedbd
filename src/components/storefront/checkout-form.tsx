"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
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

  // Native form validation runs first (required fields), then we open the
  // review modal so the customer can double-check everything before ordering.
  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirmOpen(true);
  }

  async function handlePlaceOrder() {
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
    <>
      <form
        onSubmit={handleReview}
        className="border-hairline flex flex-col gap-6 rounded-none border bg-white p-5 md:p-6"
      >
        {/* Customer section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-eyebrow text-caption-sm text-mute">Contact</h2>
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

        <div className="bg-hairline-soft h-px" />

        {/* Delivery section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-eyebrow text-caption-sm text-mute">Delivery</h2>
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
              className="bg-soft-cloud focus-visible:border-ink-900 text-body-sm h-12 w-full rounded-md border border-transparent px-4 outline-none focus-visible:bg-white"
            >
              {BD_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-hairline-soft h-px" />

        {/* Payment section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-eyebrow text-caption-sm text-mute">Payment</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method">{t("paymentMethod")}</Label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as typeof method)}
              className="bg-soft-cloud focus-visible:border-ink-900 text-body-sm h-12 w-full rounded-md border border-transparent px-4 outline-none focus-visible:bg-white"
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

        <div className="bg-hairline-soft h-px" />

        {/* Coupon section */}
        <div className="flex flex-col gap-3">
          <h2 className="text-eyebrow text-caption-sm text-mute">{t("couponLabel")}</h2>
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
              className={`flex items-center justify-between rounded-none border p-3 ${
                coupon.error ? "border-sale-500 bg-sale-50" : "border-success bg-white"
              }`}
            >
              {coupon.error ? (
                <>
                  <p role="alert" className="text-caption-md text-sale-700">
                    {coupon.error}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCoupon(null)}
                    className="text-caption-md text-sale-700 shrink-0 underline"
                  >
                    {t("tryDifferentCode")}
                  </button>
                </>
              ) : (
                <>
                  <span className="text-caption-md text-success">
                    {t("couponApplied", { code: coupon.code })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCoupon(null)}
                    className="text-caption-md text-ink-900 underline"
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
            className="border-sale-500 bg-sale-50 text-caption-md text-sale-700 rounded-none border px-3 py-2"
          >
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg">
          {t("placeOrder")}
        </Button>
      </form>

      <Dialog open={confirmOpen} onOpenChange={(o) => !submitting && setConfirmOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your order</DialogTitle>
          </DialogHeader>

          <div className="text-body-sm flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-caption-sm text-mute">{t("fullName")}</span>
              <span className="text-ink-900">{name}</span>
              <span className="text-mute font-mono text-sm">{phone}</span>
            </div>
            <div className="border-hairline-soft flex flex-col gap-0.5 border-t pt-3">
              <span className="text-eyebrow text-caption-sm text-mute">{t("address")}</span>
              <span className="text-ink-900">{address}</span>
              <span className="text-mute">{city}</span>
            </div>
            <div className="border-hairline-soft flex flex-col gap-0.5 border-t pt-3">
              <span className="text-eyebrow text-caption-sm text-mute">{t("paymentMethod")}</span>
              <span className="text-ink-900">{method === "COD" ? t("cod") : method}</span>
              {method !== "COD" && transactionRef && (
                <span className="text-mute">Txn: {transactionRef}</span>
              )}
            </div>
            <div className="border-hairline-soft flex flex-col gap-1 border-t pt-3">
              <div className="flex justify-between">
                <span className="text-mute">{t("subtotal")}</span>
                <span className="text-price text-ink-900">৳{subtotal}</span>
              </div>
              {coupon && !coupon.error && coupon.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-mute">{t("couponApplied", { code: coupon.code })}</span>
                  <span className="text-price text-ink-900">-৳{coupon.discountAmount}</span>
                </div>
              )}
              <p className="text-caption-sm text-mute mt-1">{t("deliveryFeeNote")}</p>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="border-sale-500 bg-sale-50 text-caption-md text-sale-700 rounded-none border px-3 py-2"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              {t("editDetails")}
            </Button>
            <Button type="button" variant="primary" onClick={handlePlaceOrder} loading={submitting}>
              {t("confirmPlaceOrder")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
