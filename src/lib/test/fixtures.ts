import { randomUUID } from "crypto";
import mongoose from "mongoose";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import type { CreateOrderInput } from "@/lib/validations/order.schema";

export function oid() {
  return new mongoose.Types.ObjectId();
}

export async function makeProduct(overrides: Record<string, unknown> = {}) {
  return Product.create({
    sku: `SKU-${randomUUID().slice(0, 8)}`,
    slug: `item-${randomUUID().slice(0, 8)}`,
    title: { en: "Vintage Denim Jacket" },
    brand: "Levi's",
    categoryId: oid(),
    categoryPath: { en: "Men > Jackets" },
    price: 1200,
    images: [{ url: "https://img.test/1.jpg", key: "img-1", order: 0 }],
    size: { type: "standard", standard: "M" },
    colorId: oid(),
    color: { en: "Blue" },
    ownerId: oid(),
    owner: "Owner One",
    grade: "T",
    condition: "Excellent",
    stock: 1,
    status: "ACTIVE",
    ...overrides,
  });
}

/** Guest cart holding the given products; returns the identity to order with. */
export async function makeCart(products: { _id: mongoose.Types.ObjectId }[]) {
  const cartToken = randomUUID();
  const fullProducts = await Product.find({ _id: { $in: products.map((p) => p._id) } });
  await Cart.create({
    cartToken,
    items: fullProducts.map((product) => ({
      productId: product._id,
      title: product.title,
      price: product.price,
      image: product.images[0]?.url ?? "https://img.test/1.jpg",
      quantity: 1,
    })),
  });
  return { cartToken };
}

export function orderInput(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  return {
    customer: {
      name: "Test Customer",
      phone: "01700000001",
      address: "House 1, Road 2, Dhanmondi",
      city: "Dhaka",
      ...overrides.customer,
    },
    payment: { method: "COD", ...overrides.payment },
    couponCode: overrides.couponCode,
  };
}

/** Directly insert an order document, bypassing the cart flow, for tests that
 * need a pre-existing order in a specific state. */
export async function makeOrderDoc(overrides: Record<string, unknown> = {}) {
  const productId = oid();
  return Order.create({
    orderNumber: `ORD-TEST-${randomUUID().slice(0, 6).toUpperCase()}`,
    items: [
      {
        productId,
        title: { en: "Vintage Denim Jacket" },
        price: 1200,
        image: "https://img.test/1.jpg",
        quantity: 1,
        ownerId: oid(),
        ownerName: "Owner One",
      },
    ],
    customer: { name: "Test Customer", phone: "01700000001", address: "House 1, Road 2" },
    payment: { method: "COD" },
    orderStatus: "PENDING",
    statusHistory: [{ status: "PENDING", changedAt: new Date() }],
    shippingFee: 60,
    total: 1260,
    ...overrides,
  });
}
