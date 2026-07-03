import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { connectDB } from "@/lib/db";
import { getCart } from "@/lib/services/cart.service";
import { peekCartIdentity } from "@/lib/cart-identity";
import { getActivePromotions } from "@/lib/services/promotion.service";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import type { ICartItem } from "@/models/Cart";

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
    <main className="max-w-container mx-auto w-full px-4 py-8 md:px-8">
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutForm subtotal={subtotal} />
        </div>
        <div className="border-ink-900 flex flex-col gap-3 border-2 bg-white p-5 lg:col-span-1">
          <h2 className="text-eyebrow text-ink-500">{t("orderSummary")}</h2>
          {items.map((item) => (
            <div key={String(item.productId)} className="flex justify-between text-sm">
              <span className="text-ink-700">
                {localize(item.title, locale)} × {item.quantity}
              </span>
              <span className="text-ink-900 font-semibold">৳{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-ink-200 text-ink-900 flex justify-between border-t-2 pt-3 text-sm font-semibold">
            <span>{t("subtotal")}</span>
            <span>৳{subtotal}</span>
          </div>
          <p className="text-ink-500 text-xs">{t("deliveryFeeNote")}</p>
        </div>
      </div>
    </main>
  );
}
