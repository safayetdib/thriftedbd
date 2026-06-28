import mongoose, { Schema, type Document, type Types } from "mongoose";

export type TransactionType = "COD_REMITTANCE" | "ONLINE_PAYMENT" | "ADVANCE_PAYMENT" | "REFUND";
export type TransactionMethod = "bKash" | "Nagad" | "Bank" | "Cash";
export type TransactionStatus = "PENDING" | "RECEIVED" | "RECONCILED";
export type TransactionCourierProvider = "Steadfast" | "Pathao";

export interface ITransaction extends Document {
  type: TransactionType;
  amount: number;
  method: TransactionMethod;
  reference?: string;
  orderIds: Types.ObjectId[];
  courierProvider?: TransactionCourierProvider | null;
  status: TransactionStatus;
  receivedAt?: Date;
  recordedBy: Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  type: {
    type: String,
    enum: ["COD_REMITTANCE", "ONLINE_PAYMENT", "ADVANCE_PAYMENT", "REFUND"],
    required: true,
  },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["bKash", "Nagad", "Bank", "Cash"], required: true },
  reference: { type: String },
  orderIds: { type: [Schema.Types.ObjectId], ref: "Order", default: [] },
  courierProvider: { type: String, enum: ["Steadfast", "Pathao", null], default: null },
  status: { type: String, enum: ["PENDING", "RECEIVED", "RECONCILED"], default: "PENDING" },
  receivedAt: { type: Date },
  recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.index({ orderIds: 1 });
transactionSchema.index({ status: 1 });

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);
