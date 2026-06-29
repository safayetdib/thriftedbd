import { randomUUID } from "crypto";
import mongoose, { type Types } from "mongoose";
import Order, { type IAdvancePayment, type IOrder } from "@/models/Order";
import Cart, { type ICartItem } from "@/models/Cart";
import Product from "@/models/Product";
import Blacklist from "@/models/Blacklist";
import { getSettings } from "@/lib/services/settings.service";
import { identityFilter, type CartIdentity } from "@/lib/services/cart.service";
import type {
  CreateOrderInput,
  ConfirmationCallInput,
  AdvancePaymentInput,
  CancelOrderInput,
} from "@/lib/validations/order.schema";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;
// Stock was decremented at the PENDING -> CONFIRMED transition, so only
// these statuses need it restored on cancel/return.
const STOCK_DECREMENTED_STATUSES = new Set(["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"]);

function clampLimit(limit?: number) {
  if (!limit || limit < 1) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${datePart}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

function advancePaymentSatisfied(advancePayment: IAdvancePayment) {
  return !advancePayment.required || ["PAID", "WAIVED"].includes(advancePayment.status);
}

/**
 * Stock only changes here, on the PENDING -> CONFIRMED transition, never on
 * cart-add or order placement. Re-checks each product is still ACTIVE inside
 * the transaction since a unique item can sit in multiple carts at once.
 */
async function confirmStock(order: IOrder, changedBy?: Types.ObjectId | string) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    for (const item of order.items) {
      const result = await Product.updateOne(
        { _id: item.productId, status: "ACTIVE" },
        { $set: { status: "SOLD", stock: 0 } },
        { session },
      );
      if (result.matchedCount === 0) {
        throw new Error("PRODUCT_NO_LONGER_ACTIVE");
      }
    }
    await Order.updateOne(
      { _id: order._id },
      {
        $set: { orderStatus: "CONFIRMED" },
        $push: { statusHistory: { status: "CONFIRMED", changedAt: new Date(), changedBy } },
      },
      { session },
    );
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function createOrderFromCart(
  identity: CartIdentity,
  input: CreateOrderInput,
  customerId?: string,
) {
  const cart = await Cart.findOne(identityFilter(identity));
  if (!cart || cart.items.length === 0) {
    throw new Error("CART_EMPTY");
  }

  const products = await Product.find({
    _id: { $in: cart.items.map((item: ICartItem) => item.productId) },
  });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  // Snapshot from the current product record, never the cart's stale copy —
  // price/availability may have changed since the item was added to cart.
  const orderItems = cart.items.map((item: ICartItem) => {
    const product = productMap.get(item.productId.toString());
    if (!product || product.status !== "ACTIVE") {
      throw new Error("PRODUCT_UNAVAILABLE");
    }
    return {
      productId: product._id,
      title: product.title,
      price: product.price,
      image: product.images[0]?.url ?? item.image,
      quantity: item.quantity,
      ownerId: product.ownerId,
      ownerName: product.owner,
    };
  });

  const settings = await getSettings();
  const isOutsideDhaka = (input.customer.city ?? "").trim().toLowerCase() !== "dhaka";
  const shippingFee = isOutsideDhaka
    ? settings.deliveryFee.outsideDhaka
    : settings.deliveryFee.insideDhaka;
  const itemsTotal = orderItems.reduce(
    (sum: number, item: (typeof orderItems)[number]) => sum + item.price * item.quantity,
    0,
  );
  const total = itemsTotal + shippingFee;

  const riskFlags: string[] = [];
  const blacklisted = await Blacklist.findOne({
    phone: input.customer.phone,
    isActive: true,
  }).lean();
  if (blacklisted) riskFlags.push("BLACKLISTED_PHONE");

  const priorOrderFilter = customerId
    ? { customerId, orderStatus: { $ne: "CANCELLED" } }
    : { "customer.phone": input.customer.phone, orderStatus: { $ne: "CANCELLED" } };
  const isNewBuyer = (await Order.countDocuments(priorOrderFilter)) === 0;
  if (isNewBuyer && total >= settings.riskThresholds.largeOrderAmount) {
    riskFlags.push("LARGE_ORDER_NEW_BUYER");
  }

  const advanceRequired = riskFlags.length > 0;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const [order] = await Order.create(
      [
        {
          orderNumber: generateOrderNumber(),
          items: orderItems,
          customerId,
          customer: input.customer,
          payment: { method: input.payment.method, transactionRef: input.payment.transactionRef },
          riskFlags,
          advancePayment: {
            required: advanceRequired,
            status: advanceRequired ? "REQUESTED" : "NOT_REQUIRED",
            requestedAt: advanceRequired ? new Date() : undefined,
          },
          orderStatus: "PENDING",
          statusHistory: [{ status: "PENDING", changedAt: new Date() }],
          shippingFee,
          total,
        },
      ],
      { session },
    );
    cart.convertedAt = new Date();
    cart.convertedOrderId = order._id;
    cart.items = [];
    await cart.save({ session });
    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function getAdminOrders(params: { page?: number; limit?: number; status?: string }) {
  const limit = clampLimit(params.limit);
  const page = params.page && params.page > 0 ? params.page : 1;
  const filter: Record<string, unknown> = {};
  if (params.status) filter.orderStatus = params.status;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function getOrderById(id: string) {
  return Order.findById(id).lean();
}

export async function recordConfirmationCall(
  orderId: string,
  input: ConfirmationCallInput,
  calledBy?: string,
) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.orderStatus !== "PENDING") throw new Error("ORDER_NOT_PENDING");

  order.confirmationCall.status = input.status;
  order.confirmationCall.attempts += 1;
  order.confirmationCall.calledAt = new Date();
  if (calledBy) order.confirmationCall.calledBy = calledBy as unknown as Types.ObjectId;
  if (input.notes) order.confirmationCall.notes = input.notes;
  await order.save();

  if (input.status === "CONFIRMED" && advancePaymentSatisfied(order.advancePayment)) {
    await confirmStock(order, calledBy);
  }
  return Order.findById(orderId).lean();
}

export async function updateAdvancePayment(orderId: string, input: AdvancePaymentInput) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.orderStatus !== "PENDING") throw new Error("ORDER_NOT_PENDING");

  order.advancePayment.status = input.status;
  if (input.amount) order.advancePayment.amount = input.amount;
  if (input.transactionRef) order.advancePayment.transactionRef = input.transactionRef;
  if (input.status === "PAID") order.advancePayment.paidAt = new Date();
  await order.save();

  if (
    order.confirmationCall.status === "CONFIRMED" &&
    advancePaymentSatisfied(order.advancePayment)
  ) {
    await confirmStock(order);
  }
  return Order.findById(orderId).lean();
}

export async function cancelOrder(orderId: string, input: CancelOrderInput, changedBy?: string) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (["CANCELLED", "RETURNED", "DELIVERED"].includes(order.orderStatus)) {
      throw new Error("ORDER_NOT_CANCELLABLE");
    }

    if (STOCK_DECREMENTED_STATUSES.has(order.orderStatus)) {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId },
          { $set: { status: "ACTIVE", stock: 1 } },
          { session },
        );
      }
    }

    order.orderStatus = input.action;
    order.cancelReason = input.reason;
    order.statusHistory.push({
      status: input.action,
      changedAt: new Date(),
      changedBy: changedBy as unknown as Types.ObjectId | undefined,
    });
    await order.save({ session });
    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
