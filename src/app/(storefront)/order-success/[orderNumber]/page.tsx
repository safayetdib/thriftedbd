import type { Metadata } from "next";
import Link from "next/link";
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
      <div className="border-ink-900 flex flex-col items-center gap-4 border-2 bg-white p-8 text-center md:mb-12">
        <CheckCircleIcon size={64} className="text-green-600" weight="fill" />
        <h1 className="text-ink-900 text-3xl font-extrabold">Order confirmed!</h1>
        <p className="text-ink-600 max-w-md">
          Thank you for your purchase. We&apos;ll call{" "}
          <span className="font-semibold">{order.customer.phone}</span> to confirm your order before
          dispatch.
        </p>

        <div className="border-ink-200 mt-6 w-full border-t-2 pt-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-ink-500 text-xs font-semibold uppercase">Order number</p>
              <p className="text-ink-900 mt-1 font-mono text-sm font-bold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-ink-500 text-xs font-semibold uppercase">Order date</p>
              <p className="text-ink-900 mt-1 text-sm font-semibold">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-ink-500 text-xs font-semibold uppercase">Estimated delivery</p>
              <p className="text-ink-900 mt-1 text-sm font-semibold">
                {estimatedDelivery.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-ink-500 text-xs font-semibold uppercase">Total</p>
              <p className="text-price text-ink-900 mt-1 font-bold">৳{order.total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="text-ink-900 mb-4 text-lg font-extrabold">Order items</h2>
            <div className="flex flex-col gap-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(order.items as any[]).map((item, idx) => (
                <div key={idx} className="border-ink-900 flex gap-4 border-2 bg-white p-4">
                  <div className="border-ink-900 bg-ink-100 relative size-20 shrink-0 border-2">
                    {item.image && (
                      <Image src={item.image} alt={item.title.en} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-ink-900 font-semibold">{item.title.en}</p>
                      <p className="text-ink-500 text-sm">Qty {item.quantity}</p>
                    </div>
                    <p className="text-price text-ink-900 font-semibold">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-ink-900 border-2 bg-white p-5">
            <h3 className="text-eyebrow text-ink-500 mb-3">Order summary</h3>
            <div className="space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(order.items as any[]).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-ink-700">
                    {item.title.en} × {item.quantity}
                  </span>
                  <span className="text-ink-900 font-semibold">৳{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-ink-200 flex justify-between border-t-2 pt-2 text-sm">
                <span className="text-ink-500">Subtotal</span>
                <span className="text-ink-900 font-semibold">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}৳
                  {(order.items as any[]).reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0,
                  )}
                </span>
              </div>
              {order.discountApplied > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Discount ({order.couponCode})</span>
                  <span className="font-semibold">-৳{order.discountApplied}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Delivery fee</span>
                <span className="text-ink-900 font-semibold">৳{order.shippingFee}</span>
              </div>
              <div className="border-ink-200 flex justify-between border-t-2 pt-2 font-semibold">
                <span className="text-ink-900">Total</span>
                <span className="text-price text-ink-900">৳{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="border-ink-900 border-2 bg-white p-5">
            <h3 className="text-eyebrow text-ink-500 mb-3">Delivery address</h3>
            <p className="text-ink-900 font-semibold">{order.customer.name}</p>
            <p className="text-ink-600 mt-2 text-sm">{order.customer.address}</p>
            <p className="text-ink-600 text-sm">{order.customer.city}</p>
            <p className="text-ink-600 mt-2 font-mono text-sm">{order.customer.phone}</p>
          </div>

          <Link href="/products">
            <Button variant="primary" size="lg" className="w-full">
              Continue shopping
            </Button>
          </Link>

          <Link
            href={`/track-order?orderNumber=${order.orderNumber}&phone=${encodeURIComponent(order.customer.phone)}`}
          >
            <Button variant="secondary" size="lg" className="w-full">
              Track order
            </Button>
          </Link>
        </div>
      </div>

      {promotions.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-ink-900 text-lg font-extrabold">Special offers</h2>
          <div className="flex flex-col gap-3">
            {promotions.map((promo) => (
              <div
                key={String(promo._id)}
                className="border-ink-900 border-2 p-4"
                style={{ backgroundColor: promo.backgroundColor || "#000" }}
              >
                <h3 className="font-bold text-white">{promo.headline?.en || promo.title}</h3>
                {promo.body?.en && <p className="mt-1 text-sm text-white">{promo.body.en}</p>}
                {promo.ctaLink && promo.ctaText?.en && (
                  <a
                    href={promo.ctaLink}
                    className="mt-2 inline-block text-sm text-white underline"
                  >
                    {promo.ctaText.en} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-ink-900 mb-6 text-lg font-extrabold">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={String(product._id)} href={`/products/${product.slug}`}>
                <div className="border-ink-900 hover:bg-ink-50 flex flex-col gap-2 border-2 p-3 transition-colors">
                  <div className="border-ink-900 bg-ink-100 relative aspect-square overflow-hidden border-2">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].url}
                        alt={product.title.en}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="text-ink-900 line-clamp-2 text-sm font-semibold">
                    {product.title.en}
                  </p>
                  <p className="text-price text-ink-900 font-bold">৳{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
