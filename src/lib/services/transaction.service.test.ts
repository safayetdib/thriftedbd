import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { connectTestDB, disconnectTestDB, clearTestDB } from "@/lib/test/mongo";
import { makeProduct, makeCart, makeOrderDoc, orderInput, oid } from "@/lib/test/fixtures";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import Transaction from "@/models/Transaction";
import { createOrderFromCart, recordConfirmationCall } from "@/lib/services/order.service";
import { reconcileTransaction } from "@/lib/services/transaction.service";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  await Settings.create({
    deliveryFee: { insideDhaka: 60, outsideDhaka: 120 },
    riskThresholds: { largeOrderAmount: 5000 },
  });
});

describe("reconcileTransaction", () => {
  it("marks a batched COD remittance REMITTED across all linked orders", async () => {
    // One remittance frequently settles several delivered orders at once.
    const orderA = await makeOrderDoc({ orderStatus: "DELIVERED" });
    const orderB = await makeOrderDoc({ orderStatus: "DELIVERED" });
    const untouched = await makeOrderDoc({ orderStatus: "DELIVERED" });

    const transaction = await Transaction.create({
      type: "COD_REMITTANCE",
      amount: 2520,
      method: "bKash",
      orderIds: [orderA._id, orderB._id],
      courierProvider: "Steadfast",
      recordedBy: oid(),
    });

    const reconciled = await reconcileTransaction(transaction._id.toString());

    expect(reconciled!.status).toBe("RECONCILED");
    expect(reconciled!.receivedAt).toBeInstanceOf(Date);

    const freshA = await Order.findById(orderA._id);
    const freshB = await Order.findById(orderB._id);
    const freshUntouched = await Order.findById(untouched._id);
    expect(freshA!.payment.status).toBe("REMITTED");
    expect(freshA!.payment.remittedAt).toBeInstanceOf(Date);
    expect(freshB!.payment.status).toBe("REMITTED");
    expect(freshUntouched!.payment.status).toBe("PENDING");
  });

  it("rejects reconciling the same transaction twice", async () => {
    const order = await makeOrderDoc({ orderStatus: "DELIVERED" });
    const transaction = await Transaction.create({
      type: "COD_REMITTANCE",
      amount: 1260,
      method: "Bank",
      orderIds: [order._id],
      recordedBy: oid(),
    });

    await reconcileTransaction(transaction._id.toString());
    await expect(reconcileTransaction(transaction._id.toString())).rejects.toThrow(
      "ALREADY_RECONCILED",
    );
  });

  it("applies an ADVANCE_PAYMENT: pays the advance and confirms stock when the call is already confirmed", async () => {
    const product = await makeProduct({ price: 6000 }); // over threshold -> advance required
    const identity = await makeCart([product]);
    const order = await createOrderFromCart(identity, orderInput());
    expect(order.advancePayment.required).toBe(true);

    // Call confirmed but advance unpaid -> still PENDING, stock untouched.
    await recordConfirmationCall(order._id.toString(), { status: "CONFIRMED" });
    expect((await Order.findById(order._id))!.orderStatus).toBe("PENDING");

    const transaction = await Transaction.create({
      type: "ADVANCE_PAYMENT",
      amount: 500,
      method: "bKash",
      reference: "TX-ADV-1",
      orderIds: [order._id],
      recordedBy: oid(),
    });

    await reconcileTransaction(transaction._id.toString());

    const fresh = await Order.findById(order._id);
    expect(fresh!.advancePayment.status).toBe("PAID");
    expect(fresh!.orderStatus).toBe("CONFIRMED");
    const freshProduct = await Product.findById(product._id);
    expect(freshProduct!.status).toBe("SOLD");
    expect(freshProduct!.stock).toBe(0);
  });
});
