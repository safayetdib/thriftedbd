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
      <h1 className="text-ink-900 mb-6 text-2xl font-extrabold">{t("title")}</h1>

      {promotions.length > 0 && (
        <div className="mb-6 space-y-3">
          {promotions.map((promo) => (
            <div
              key={String(promo._id)}
              className="border-ink-900 border-2 p-3"
              style={{ backgroundColor: promo.backgroundColor || "#000" }}
            >
              <h3 className="text-sm font-bold text-white">
                {localize(promo.headline, locale) || promo.title}
              </h3>
              {localize(promo.body, locale) && (
                <p className="mt-1 text-xs text-white">{localize(promo.body, locale)}</p>
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
          <div className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5 md:p-6">
            <h2 className="text-eyebrow text-ink-500">{t("orderSummary")}</h2>

            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={String(item.productId)} className="flex items-center gap-3">
                  <div className="border-ink-900 bg-ink-100 relative size-10 shrink-0 border-2">
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
                    <span className="text-ink-700 truncate text-sm">
                      {localize(item.title, locale)}{" "}
                      <span className="text-ink-400">×{item.quantity}</span>
                    </span>
                    <span className="text-ink-900 shrink-0 text-sm font-semibold">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-ink-200 h-px" />

            <div className="flex items-center justify-between">
              <span className="text-ink-600 text-sm">{t("subtotal")}</span>
              <span className="text-ink-900 font-bold">৳{subtotal}</span>
            </div>

            <div className="bg-ink-200 h-px" />

            <div className="flex items-center justify-between">
              <span className="text-ink-900 text-sm font-bold">Total</span>
              <span className="text-ink-900 text-xl font-extrabold">৳{subtotal}</span>
            </div>

            <p className="text-ink-500 text-xs leading-relaxed">{t("deliveryFeeNote")}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
