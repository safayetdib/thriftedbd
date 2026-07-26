import dynamic from "next/dynamic";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { getCart } from "@/lib/services/cart.service";
import { peekCartIdentity } from "@/lib/cart-identity";
import { getActivePromotions } from "@/lib/services/promotion.service";
import type { ICartItem } from "@/models/Cart";

const CheckoutForm = dynamic(() =>
  import("@/components/storefront/checkout-form").then((mod) => mod.CheckoutForm),
);

export default async function CheckoutPage() {
  await connectDB();
  const locale = await getLocale();
  const t = await getTranslations("checkout");
  const identity = await peekCartIdentity();
  const [cart, promotions] = await Promise.all([
    identity ? getCart(identity) : null,
    getActivePromotions(["checkout", "global"]),
  ]);
  const items: ICartItem[] = cart?.items ?? [];

  if (items.length === 0) {
    redirect({ href: "/cart", locale });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="max-w-container mx-auto w-full px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-heading-xl text-ink-900 mb-6">{t("title")}</h1>

      {promotions.length > 0 && (
        <div className="mb-6 space-y-3">
          {promotions.map((promo) => (
            <div
              key={String(promo._id)}
              className="rounded-none p-3"
              style={{ backgroundColor: promo.backgroundColor || "#000" }}
            >
              <h3 className="text-caption-md text-white">
                {localize(promo.headline, locale) || promo.title}
              </h3>
              {localize(promo.body, locale) && (
                <p className="text-caption-sm mt-1 text-white">{localize(promo.body, locale)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm subtotal={subtotal} />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="border-hairline flex flex-col gap-4 rounded-none border bg-white p-5 md:p-6">
            <h2 className="text-eyebrow text-caption-sm text-mute">{t("orderSummary")}</h2>

            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={String(item.productId)} className="flex items-center gap-3">
                  <div className="bg-soft-cloud relative size-10 shrink-0 rounded-none">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={localize(item.title, locale)}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="text-body-sm text-charcoal truncate">
                      {localize(item.title, locale)}{" "}
                      <span className="text-mute">×{item.quantity}</span>
                    </span>
                    <span className="text-price text-caption-md text-ink-900 shrink-0">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-hairline-soft h-px" />

            <div className="flex items-center justify-between">
              <span className="text-body-sm text-mute">{t("subtotal")}</span>
              <span className="text-price text-body-strong text-ink-900">৳{subtotal}</span>
            </div>

            <div className="bg-hairline-soft h-px" />

            <div className="flex items-center justify-between">
              <span className="text-caption-md text-ink-900">Total</span>
              <span className="text-price text-ink-900 text-xl font-medium">৳{subtotal}</span>
            </div>

            <p className="text-caption-sm text-mute leading-relaxed">{t("deliveryFeeNote")}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
