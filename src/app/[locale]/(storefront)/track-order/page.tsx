"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  const t = useTranslations("trackOrder");
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const orderNumber = searchParams.get("orderNumber");

  const [error, formAction, isPending] = useActionState(trackOrderAction, undefined);

  return (
    <main className="bg-soft-cloud flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="border-hairline w-full max-w-md rounded-none border bg-white p-8">
        <p className="text-eyebrow text-caption-sm text-ink-900">thriftedBD</p>
        <h1 className="text-heading-xl text-ink-900 mt-1">{t("title")}</h1>
        <p className="text-body-sm text-mute mt-1">{t("blurb")}</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">{t("phone")}</Label>
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
            <Label htmlFor="orderNumber">{t("orderNumber")}</Label>
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
            <p
              role="alert"
              className="border-sale-500 bg-sale-50 text-sale-700 text-caption-md rounded-none border px-3 py-2"
            >
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="mt-2 w-full" loading={isPending}>
            {t("title")}
          </Button>
        </form>

        <div className="text-body-sm text-mute mt-6 text-center">
          <Link href="/" className="text-caption-md text-ink-900 underline hover:no-underline">
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
