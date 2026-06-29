import mongoose from "mongoose";
import Transaction from "@/models/Transaction";
import Order from "@/models/Order";
import { updateAdvancePayment } from "@/lib/services/order.service";
import type { CreateTransactionInput } from "@/lib/validations/transaction.schema";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

function clampLimit(limit?: number) {
  if (!limit || limit < 1) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

export async function createTransaction(input: CreateTransactionInput, recordedBy: string) {
  return Transaction.create({ ...input, recordedBy, status: "PENDING" });
}

export async function getTransactions(params: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}) {
  const limit = clampLimit(params.limit);
  const page = params.page && params.page > 0 ? params.page : 1;
  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.type) filter.type = params.type;

  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function getTransactionById(id: string) {
  return Transaction.findById(id).lean();
}

/**
 * Marks the ledger entry RECONCILED and updates `payment.status` on every
 * linked order — a single remittance often settles several orders at once,
 * so this is the multi-document write docs/api-conventions.md calls out.
 *
 * ADVANCE_PAYMENT entries are applied via `updateAdvancePayment` instead of
 * a raw $set, after this transaction commits: that function carries its own
 * stock-confirmation transaction (PENDING -> CONFIRMED once the call is also
 * confirmed), which can't safely nest inside this one.
 */
export async function reconcileTransaction(id: string) {
  const session = await mongoose.startSession();
  let transaction;
  try {
    session.startTransaction();
    transaction = await Transaction.findById(id).session(session);
    if (!transaction) throw new Error("TRANSACTION_NOT_FOUND");
    if (transaction.status === "RECONCILED") throw new Error("ALREADY_RECONCILED");

    if (transaction.type !== "ADVANCE_PAYMENT") {
      const paymentStatus =
        transaction.type === "COD_REMITTANCE"
          ? "REMITTED"
          : transaction.type === "ONLINE_PAYMENT"
            ? "PAID"
            : "REFUNDED";
      const update: Record<string, unknown> = { "payment.status": paymentStatus };
      if (transaction.type === "COD_REMITTANCE") update["payment.remittedAt"] = new Date();

      await Order.updateMany({ _id: { $in: transaction.orderIds } }, { $set: update }, { session });
    }

    transaction.status = "RECONCILED";
    transaction.receivedAt = new Date();
    await transaction.save({ session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  if (transaction.type === "ADVANCE_PAYMENT") {
    // Applied order-by-order so one order in a non-PENDING state (already
    // confirmed/cancelled) doesn't block the advance payment from being
    // recorded against the others.
    for (const orderId of transaction.orderIds) {
      try {
        await updateAdvancePayment(orderId.toString(), {
          status: "PAID",
          transactionRef: transaction.reference,
        });
      } catch (err) {
        if (!(err instanceof Error && err.message === "ORDER_NOT_PENDING")) throw err;
      }
    }
  }

  return Transaction.findById(id).lean();
}
