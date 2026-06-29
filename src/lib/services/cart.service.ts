import Cart, { type ICartItem } from "@/models/Cart";
import Product from "@/models/Product";

export type CartIdentity = { customerId: string } | { cartToken: string };

function identityFilter(identity: CartIdentity) {
  return "customerId" in identity
    ? { customerId: identity.customerId }
    : { cartToken: identity.cartToken };
}

export async function getCart(identity: CartIdentity) {
  return Cart.findOne(identityFilter(identity)).lean();
}

async function getOrCreateCart(identity: CartIdentity) {
  const filter = identityFilter(identity);
  let cart = await Cart.findOne(filter);
  if (!cart) {
    cart = await Cart.create({ ...filter, items: [] });
  }
  return cart;
}

export async function addCartItem(identity: CartIdentity, productId: string) {
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }
  // Unique-item inventory: a product still showing ACTIVE can already be in
  // another customer's cart, so this re-check matters even though it doesn't
  // fully close the race — the real guard is the re-check at order confirmation.
  if (product.status !== "ACTIVE") {
    throw new Error("PRODUCT_NOT_ACTIVE");
  }
  if (!product.images[0]?.url) {
    throw new Error("PRODUCT_MISSING_IMAGE");
  }

  const cart = await getOrCreateCart(identity);
  const alreadyInCart = cart.items.some(
    (item: ICartItem) => item.productId.toString() === productId,
  );
  if (alreadyInCart) {
    return cart;
  }

  cart.items.push({
    productId: product._id,
    title: product.title,
    price: product.price,
    image: product.images[0].url,
    quantity: 1,
    addedAt: new Date(),
  });
  cart.lastActivityAt = new Date();
  await cart.save();
  return cart;
}

export async function removeCartItem(identity: CartIdentity, productId: string) {
  const cart = await Cart.findOne(identityFilter(identity));
  if (!cart) {
    throw new Error("CART_NOT_FOUND");
  }
  cart.items = cart.items.filter((item: ICartItem) => item.productId.toString() !== productId);
  cart.lastActivityAt = new Date();
  await cart.save();
  return cart;
}
