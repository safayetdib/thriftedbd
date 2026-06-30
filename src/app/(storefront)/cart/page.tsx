import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { getCart } from "@/lib/services/cart.service";
import { peekCartIdentity } from "@/lib/cart-identity";
import { getSettings } from "@/lib/services/settings.service";
import { getActivePromotions } from "@/lib/services/promotion.service";
import { getProductById } from "@/lib/services/product.service";
import { Button } from "@/components/ui/button";
import { RemoveFromCartButton } from "@/components/storefront/remove-from-cart-button";
import type { ICartItem } from "@/models/Cart";
import type { IProduct } from "@/models/Product";

export default async function CartPage() {
  await connectDB();
  const identity = await peekCartIdentity();
  const [cart, settings, promotions] = await Promise.all([
    identity ? getCart(identity) : null,
    getSettings(),
    getActivePromotions(["cart", "global"]),
  ]);
  const items: ICartItem[] = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let featuredProducts: IProduct[] = [];
  if (settings.homepage?.featuredProductIds && settings.homepage.featuredProductIds.length > 0) {
    const featuredIds = settings.homepage.featuredProductIds.slice(0, 4);
    const products = await Promise.all(featuredIds.map((id) => getProductById(String(id))));
    featuredProducts = products.filter((p): p is IProduct => p !== null && p.status === "ACTIVE");
  }

  if (items.length === 0) {
    return (
      <main className="max-w-container mx-auto flex w-full flex-col items-center gap-4 px-4 py-24 text-center md:px-8">
        <h1 className="text-ink-900 text-2xl font-extrabold">Your bag is empty</h1>
        <p className="text-ink-500">Add something you love to get started.</p>
        <Link href="/products">
          <Button variant="primary">Browse products</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-container mx-auto w-full px-4 py-8 md:px-8">
      <h1 className="text-ink-900 mb-6 text-2xl font-extrabold">Your bag</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={String(item.productId)}
              className="border-ink-900 flex gap-4 border-2 bg-white p-4"
            >
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
                <p className="text-price text-ink-900 font-semibold">৳{item.price}</p>
              </div>
              <RemoveFromCartButton productId={String(item.productId)} />
            </div>
          ))}
        </div>

        <div className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5 lg:col-span-1">
          <h2 className="text-eyebrow text-ink-500">Order summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-ink-500">Subtotal</span>
            <span className="text-ink-900 font-semibold">৳{subtotal}</span>
          </div>
          <p className="text-ink-500 text-xs">
            Delivery: ৳{settings.deliveryFee.insideDhaka} inside Dhaka, ৳
            {settings.deliveryFee.outsideDhaka} outside Dhaka — calculated at checkout.
          </p>
          <Link href="/checkout">
            <Button variant="primary" size="lg" className="w-full">
              Checkout
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
          <h2 className="text-ink-900 mb-6 text-lg font-extrabold">Complete your look</h2>
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
