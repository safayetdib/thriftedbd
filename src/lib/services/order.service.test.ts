import {
  advanceOrderStatus,
  cancelOrder,
  createOrderFromCart,
  recordConfirmationCall,
  updateAdvancePayment,
} from "@/lib/services/order.service";
import { makeCart, makeOrderDoc, makeProduct, oid, orderInput } from "@/lib/test/fixtures";
import { clearTestDB, connectTestDB, disconnectTestDB } from "@/lib/test/mongo";
import Blacklist from "@/models/Blacklist";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const FEES = { insideDhaka: 60, outsideDhaka: 120 };
const LARGE_ORDER = 5000;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  await Settings.create({
    deliveryFee: FEES,
    riskThresholds: { largeOrderAmount: LARGE_ORDER },
  });
});

describe("createOrderFromCart", () => {
  it("computes the total server-side (items + shipping) and never touches stock", async () => {
    const product = await makeProduct({ price: 1200 });
    const identity = await makeCart([product]);

    const order = await createOrderFromCart(identity, orderInput());

    expect(order.total).toBe(1200 + FEES.insideDhaka);
    expect(order.shippingFee).toBe(FEES.insideDhaka);
    expect(order.orderStatus).toBe("PENDING");

    // Placement must not decrement stock - that only happens on confirmation.
    const fresh = await Product.findById(product._id);
    expect(fresh!.status).toBe("ACTIVE");
    expect(fresh!.stock).toBe(1);

    // Cart converts and empties.
    const cart = await Cart.findOne({ cartToken: identity.cartToken });
    expect(cart!.items).toHaveLength(0);
    expect(cart!.convertedOrderId?.toString()).toBe(order._id.toString());
  });

  it("charges the outside-Dhaka shipping fee for non-Dhaka cities", async () => {
    const product = await makeProduct({ price: 1000 });
    const identity = await makeCart([product]);

    const order = await createOrderFromCart(
      identity,
      orderInput({
        customer: { name: "T", phone: "01700000002", address: "A", city: "Chattogram" },
      }),
    );

    expect(order.shippingFee).toBe(FEES.outsideDhaka);
    expect(order.total).toBe(1000 + FEES.outsideDhaka);
  });

  it("rejects when a cart item is no longer ACTIVE (sold from under the cart)", async () => {
    const product = await makeProduct({ status: "SOLD", stock: 0 });
    const identity = await makeCart([product]);

    await expect(createOrderFromCart(identity, orderInput())).rejects.toThrow(
      "PRODUCT_UNAVAILABLE",
    );
    expect(await Order.countDocuments()).toBe(0);
  });

  it("flags a blacklisted phone and requires advance payment", async () => {
    await Blacklist.create({ phone: "01799999999", reason: "repeat refusals", addedBy: oid() });
    const product = await makeProduct();
    const identity = await makeCart([product]);

    const order = await createOrderFromCart(
      identity,
      orderInput({ customer: { name: "T", phone: "01799999999", address: "A", city: "Dhaka" } }),
    );

    expect(order.riskFlags).toContain("BLACKLISTED_PHONE");
    expect(order.advancePayment.required).toBe(true);
    expect(order.advancePayment.status).toBe("REQUESTED");
  });

  it("flags a large first order from a new buyer, but not from a repeat buyer", async () => {
    const expensive = await makeProduct({ price: LARGE_ORDER + 1000 });
    const identity = await makeCart([expensive]);

    const order = await createOrderFromCart(identity, orderInput());
    expect(order.riskFlags).toContain("LARGE_ORDER_NEW_BUYER");
    expect(order.advancePayment.required).toBe(true);

    // Same phone now has a prior (non-cancelled) order -> no flag next time.
    const expensive2 = await makeProduct({ price: LARGE_ORDER + 1000 });
    const identity2 = await makeCart([expensive2]);
    const order2 = await createOrderFromCart(identity2, orderInput());
    expect(order2.riskFlags).not.toContain("LARGE_ORDER_NEW_BUYER");
    expect(order2.advancePayment.required).toBe(false);
  });
});

describe("stock transition on confirmation", () => {
  it("PENDING -> CONFIRMED marks the product SOLD with stock 0", async () => {
    const product = await makeProduct();
    const identity = await makeCart([product]);
    const order = await createOrderFromCart(identity, orderInput());

    const updated = await recordConfirmationCall(order._id.toString(), { status: "CONFIRMED" });

    expect(updated!.orderStatus).toBe("CONFIRMED");
    expect(updated!.statusHistory.map((h: { status: string }) => h.status)).toContain("CONFIRMED");

    const fresh = await Product.findById(product._id);
    expect(fresh!.status).toBe("SOLD");
    expect(fresh!.stock).toBe(0);
  });

  it("holds stock while advance payment is outstanding, confirms once PAID", async () => {
    await Blacklist.create({ phone: "01788888888", reason: "test", addedBy: oid() });
    const product = await makeProduct();
    const identity = await makeCart([product]);
    const order = await createOrderFromCart(
      identity,
      orderInput({ customer: { name: "T", phone: "01788888888", address: "A", city: "Dhaka" } }),
    );

    // Call confirmed, but advance payment still REQUESTED -> no stock change.
    const afterCall = await recordConfirmationCall(order._id.toString(), { status: "CONFIRMED" });
    expect(afterCall!.orderStatus).toBe("PENDING");
    expect((await Product.findById(product._id))!.status).toBe("ACTIVE");

    // Advance paid -> now the order confirms and stock moves.
    const afterPayment = await updateAdvancePayment(order._id.toString(), { status: "PAID" });
    expect(afterPayment!.orderStatus).toBe("CONFIRMED");
    expect((await Product.findById(product._id))!.status).toBe("SOLD");
  });

  it("race guard: confirming a second order for the same unique item fails and stays PENDING", async () => {
    const product = await makeProduct();
    const identityA = await makeCart([product]);
    const identityB = await makeCart([product]);
    const orderA = await createOrderFromCart(identityA, orderInput());
    const orderB = await createOrderFromCart(
      identityB,
      orderInput({ customer: { name: "B", phone: "01700000003", address: "B", city: "Dhaka" } }),
    );

    await recordConfirmationCall(orderA._id.toString(), { status: "CONFIRMED" });

    await expect(
      recordConfirmationCall(orderB._id.toString(), { status: "CONFIRMED" }),
    ).rejects.toThrow("PRODUCT_NO_LONGER_ACTIVE");

    const freshB = await Order.findById(orderB._id);
    expect(freshB!.orderStatus).toBe("PENDING");
  });

  it("rolls back all writes when confirmation fails mid-way (multi-item order)", async () => {
    const p1 = await makeProduct();
    const p2 = await makeProduct();
    const identity = await makeCart([p1, p2]);
    const order = await createOrderFromCart(identity, orderInput());

    // p2 sells elsewhere after placement - confirmation must now fail whole.
    await Product.updateOne({ _id: p2._id }, { $set: { status: "SOLD", stock: 0 } });

    await expect(
      recordConfirmationCall(order._id.toString(), { status: "CONFIRMED" }),
    ).rejects.toThrow("PRODUCT_NO_LONGER_ACTIVE");

    // The transaction must roll p1 back - no half-confirmed state.
    const freshP1 = await Product.findById(p1._id);
    expect(freshP1!.status).toBe("ACTIVE");
    expect(freshP1!.stock).toBe(1);
    expect((await Order.findById(order._id))!.orderStatus).toBe("PENDING");
  });
});

describe("cancelOrder", () => {
  it("cancelling a CONFIRMED order restores the product to ACTIVE with stock 1", async () => {
    const product = await makeProduct();
    const identity = await makeCart([product]);
    const order = await createOrderFromCart(identity, orderInput());
    await recordConfirmationCall(order._id.toString(), { status: "CONFIRMED" });

    const cancelled = await cancelOrder(order._id.toString(), {
      action: "CANCELLED",
      reason: "customer changed mind",
    });

    expect(cancelled.orderStatus).toBe("CANCELLED");
    expect(cancelled.cancelReason).toBe("customer changed mind");
    const fresh = await Product.findById(product._id);
    expect(fresh!.status).toBe("ACTIVE");
    expect(fresh!.stock).toBe(1);
  });

  it("returning a SHIPPED order restores stock", async () => {
    const product = await makeProduct();
    const identity = await makeCart([product]);
    const order = await createOrderFromCart(identity, orderInput());
    await recordConfirmationCall(order._id.toString(), { status: "CONFIRMED" });
    await advanceOrderStatus(order._id.toString(), { status: "PACKED" });
    await advanceOrderStatus(order._id.toString(), { status: "SHIPPED" });

    const returned = await cancelOrder(order._id.toString(), {
      action: "RETURNED",
      reason: "customer refused delivery",
    });

    expect(returned.orderStatus).toBe("RETURNED");
    const fresh = await Product.findById(product._id);
    expect(fresh!.status).toBe("ACTIVE");
    expect(fresh!.stock).toBe(1);
  });

  it("cancelling a still-PENDING order does not touch the product", async () => {
    const product = await makeProduct();
    const identity = await makeCart([product]);
    const order = await createOrderFromCart(identity, orderInput());

    await cancelOrder(order._id.toString(), { action: "CANCELLED", reason: "duplicate order" });

    const fresh = await Product.findById(product._id);
    expect(fresh!.status).toBe("ACTIVE");
    expect(fresh!.stock).toBe(1);
  });

  it("refuses to cancel a DELIVERED order", async () => {
    const order = await makeOrderDoc({ orderStatus: "DELIVERED" });
    await expect(
      cancelOrder(order._id.toString(), { action: "CANCELLED", reason: "too late" }),
    ).rejects.toThrow("ORDER_NOT_CANCELLABLE");
  });
});
