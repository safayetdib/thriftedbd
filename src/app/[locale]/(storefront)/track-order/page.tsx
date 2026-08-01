"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChatCircleTextIcon, ReceiptIcon, TruckIcon } from "@phosphor-icons/react";
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

  const tips = [
    { Icon: ReceiptIcon, title: t("tipOrderNumberTitle"), body: t("tipOrderNumberBody") },
    { Icon: TruckIcon, title: t("tipDeliveryTitle"), body: t("tipDeliveryBody") },
    { Icon: ChatCircleTextIcon, title: t("tipHelpTitle"), body: t("tipHelpBody") },
  ];

  return (
    <main className="max-w-container mx-auto w-full px-4 py-12 md:px-8 md:py-16">
      <div className="mb-8 max-w-2xl md:mb-12">
        <h1 className="text-heading-xl text-ink-900 mb-2">{t("title")}</h1>
        <p className="text-body-md text-mute">{t("blurb")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
        {/* Lookup form */}
        <form
          action={formAction}
          className="border-hairline flex h-fit flex-col gap-4 rounded-none border bg-white p-6 md:p-8"
        >
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

        {/* Help notes */}
        <div className="flex max-w-md flex-col gap-6">
          {tips.map(({ Icon, title, body }) => (
            <div key={title} className="flex items-start gap-4">
              <span className="bg-soft-cloud text-ink-900 flex size-11 shrink-0 items-center justify-center rounded-full">
                <Icon size={22} aria-hidden />
              </span>
              <div>
                <h2 className="text-body-sm-strong text-ink-900 mb-1">{title}</h2>
                <p className="text-body-sm text-mute">{body}</p>
              </div>
            </div>
          ))}
          <p className="text-body-sm text-mute">
            <Link
              href="/contact"
              className="text-ink-900 underline underline-offset-2"
              prefetch={false}
            >
              {t("contactLink")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
