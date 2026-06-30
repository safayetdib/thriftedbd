import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getCart } from "@/lib/services/cart.service";
import { peekCartIdentity } from "@/lib/cart-identity";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import type { ICartItem } from "@/models/Cart";

export default async function CheckoutPage() {
  await connectDB();
  const identity = await peekCartIdentity();
  const cart = identity ? await getCart(identity) : null;
  const items: ICartItem[] = cart?.items ?? [];

  if (items.length === 0) {
    redirect("/cart");
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="max-w-container mx-auto w-full px-4 py-8 md:px-8">
      <h1 className="text-ink-900 mb-6 text-2xl font-extrabold">Checkout</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutForm />
        </div>
        <div className="border-ink-900 flex flex-col gap-3 border-2 bg-white p-5 lg:col-span-1">
          <h2 className="text-eyebrow text-ink-500">Order summary</h2>
          {items.map((item) => (
            <div key={String(item.productId)} className="flex justify-between text-sm">
              <span className="text-ink-700">
                {item.title.en} × {item.quantity}
              </span>
              <span className="text-ink-900 font-semibold">৳{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-ink-200 text-ink-900 flex justify-between border-t-2 pt-3 text-sm font-semibold">
            <span>Subtotal</span>
            <span>৳{subtotal}</span>
          </div>
          <p className="text-ink-500 text-xs">Delivery fee is added once you place the order.</p>
        </div>
      </div>
    </main>
  );
}
