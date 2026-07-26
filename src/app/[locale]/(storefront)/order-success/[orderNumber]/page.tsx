import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import { getActivePromotions } from "@/lib/services/promotion.service";
import { getProductById } from "@/lib/services/product.service";
import Order from "@/models/Order";
import { Button } from "@/components/ui/button";
import type { IProduct } from "@/models/Product";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} Confirmed | thriftedBD`,
    description: "Your order has been placed successfully.",
  };
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  await connectDB();
  const locale = await getLocale();
  const t = await getTranslations("orderSuccess");
  const order = await Order.findOne({ orderNumber }).lean();

  if (!order) {
    notFound();
  }

  const [settings, promotions] = await Promise.all([
    getSettings(),
    getActivePromotions(["success", "global"]),
  ]);

  let featuredProducts: IProduct[] = [];
  if (settings.homepage?.featuredProductIds && settings.homepage.featuredProductIds.length > 0) {
    const featuredIds = settings.homepage.featuredProductIds.slice(0, 4);
    const products = await Promise.all(
      featuredIds.map((id: unknown) => getProductById(String(id))),
    );
    featuredProducts = products.filter((p): p is IProduct => p !== null && p.status === "ACTIVE");
  }

  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <main className="max-w-container mx-auto w-full px-4 py-12 md:px-8">
      <div className="border-hairline flex flex-col items-center gap-4 rounded-none border bg-white p-8 text-center md:mb-12">
        <CheckCircleIcon size={64} className="text-success" weight="fill" />
        <h1 className="text-heading-xl text-ink-900">{t("title")}</h1>
        <p className="text-body-md text-charcoal max-w-md">
          {t.rich("blurb", {
            phone: () => <span className="text-body-strong">{order.customer.phone}</span>,
          })}
        </p>

        <div className="border-hairline-soft mt-6 w-full border-t pt-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-eyebrow text-caption-sm text-mute">{t("orderNumber")}</p>
              <p className="text-ink-900 mt-1 font-mono text-sm font-medium">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-eyebrow text-caption-sm text-mute">{t("orderDate")}</p>
              <p className="text-caption-md text-ink-900 mt-1">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-eyebrow text-caption-sm text-mute">{t("estimatedDelivery")}</p>
              <p className="text-caption-md text-ink-900 mt-1">
                {estimatedDelivery.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-eyebrow text-caption-sm text-mute">{t("total")}</p>
              <p className="text-price text-body-strong text-ink-900 mt-1">৳{order.total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="text-heading-lg text-ink-900 mb-4">{t("orderItems")}</h2>
            <div className="flex flex-col gap-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(order.items as any[]).map((item, idx) => (
                <div
                  key={idx}
                  className="border-hairline flex gap-4 rounded-none border bg-white p-4"
                >
                  <div className="bg-soft-cloud relative size-20 shrink-0 rounded-none">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={localize(item.title, locale)}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-body-strong text-ink-900">
                        {localize(item.title, locale)}
                      </p>
                      <p className="text-body-sm text-mute">{t("qty", { count: item.quantity })}</p>
                    </div>
                    <p className="text-price text-body-strong text-ink-900">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-hairline rounded-none border bg-white p-5">
            <h3 className="text-eyebrow text-caption-sm text-mute mb-3">{t("orderSummary")}</h3>
            <div className="space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(order.items as any[]).map((item, idx) => (
                <div key={idx} className="text-body-sm flex justify-between">
                  <span className="text-charcoal">
                    {localize(item.title, locale)} × {item.quantity}
                  </span>
                  <span className="text-price text-caption-md text-ink-900">
                    ৳{item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="border-hairline-soft text-body-sm flex justify-between border-t pt-2">
                <span className="text-mute">{t("subtotal")}</span>
                <span className="text-price text-caption-md text-ink-900">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}৳
                  {(order.items as any[]).reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0,
                  )}
                </span>
              </div>
              {order.discountApplied > 0 && (
                <div className="text-body-sm text-charcoal flex justify-between">
                  <span>{t("discount", { code: order.couponCode ?? "" })}</span>
                  <span className="text-price text-caption-md text-ink-900">
                    -৳{order.discountApplied}
                  </span>
                </div>
              )}
              <div className="text-body-sm flex justify-between">
                <span className="text-mute">{t("deliveryFee")}</span>
                <span className="text-price text-caption-md text-ink-900">
                  ৳{order.shippingFee}
                </span>
              </div>
              <div className="border-hairline-soft flex justify-between border-t pt-2">
                <span className="text-body-strong text-ink-900">{t("total")}</span>
                <span className="text-price text-body-strong text-ink-900">৳{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="border-hairline rounded-none border bg-white p-5">
            <h3 className="text-eyebrow text-caption-sm text-mute mb-3">{t("deliveryAddress")}</h3>
            <p className="text-body-strong text-ink-900">{order.customer.name}</p>
            <p className="text-body-sm text-mute mt-2">{order.customer.address}</p>
            <p className="text-body-sm text-mute">{order.customer.city}</p>
            <p className="text-mute mt-2 font-mono text-sm">{order.customer.phone}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/products" className="block">
              <Button variant="primary" size="lg" className="w-full">
                {t("continueShopping")}
              </Button>
            </Link>

            <Link
              href={`/track-order?orderNumber=${order.orderNumber}&phone=${encodeURIComponent(order.customer.phone)}`}
              className="block"
            >
              <Button variant="secondary" size="lg" className="w-full">
                {t("trackOrder")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {promotions.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-heading-lg text-ink-900">{t("specialOffers")}</h2>
          <div className="flex flex-col gap-3">
            {promotions.map((promo) => (
              <div
                key={String(promo._id)}
                className="rounded-none p-4"
                style={{ backgroundColor: promo.backgroundColor || "#000" }}
              >
                <h3 className="text-body-strong text-white">
                  {localize(promo.headline, locale) || promo.title}
                </h3>
                {localize(promo.body, locale) && (
                  <p className="text-body-sm mt-1 text-white">{localize(promo.body, locale)}</p>
                )}
                {promo.ctaLink && localize(promo.ctaText, locale) && (
                  <a
                    href={promo.ctaLink}
                    className="text-caption-md mt-2 inline-block text-white underline"
                  >
                    {localize(promo.ctaText, locale)} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-heading-lg text-ink-900 mb-6">{t("youMightAlsoLike")}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={String(product._id)} href={`/products/${product.slug}`}>
                <div className="hover:bg-soft-cloud flex flex-col gap-2 rounded-none p-3 transition-colors">
                  <div className="bg-soft-cloud relative aspect-square overflow-hidden rounded-none">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].url}
                        alt={localize(product.title, locale)}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="text-caption-md text-ink-900 line-clamp-2">
                    {localize(product.title, locale)}
                  </p>
                  <p className="text-price text-body-strong text-ink-900">৳{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
