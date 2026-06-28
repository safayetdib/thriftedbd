import mongoose, { Schema, type Document, type Types } from "mongoose";
import { i18nTextSchema, type I18nText } from "./shared";

export type PaymentMethod = "COD" | "bKash" | "Nagad" | "Card";
export type PaymentStatus = "PENDING" | "PAID" | "COLLECTED" | "REMITTED" | "FAILED" | "REFUNDED";
export type ConfirmationCallStatus = "NOT_CALLED" | "CONFIRMED" | "UNREACHABLE" | "ON_HOLD";
export type AdvancePaymentStatus = "NOT_REQUIRED" | "REQUESTED" | "PAID" | "WAIVED";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";
export type CourierProvider = "Steadfast" | "Pathao";

export interface IOrderItem {
  productId: Types.ObjectId;
  title: I18nText;
  price: number;
  image: string;
  quantity: number;
  ownerId: Types.ObjectId;
  ownerName: string;
}

export interface IOrderCustomer {
  name: string;
  phone: string;
  address: string;
  city?: string;
}

export interface IOrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string;
  collectedAt?: Date;
  remittedAt?: Date;
}

export interface IConfirmationCall {
  status: ConfirmationCallStatus;
  attempts: number;
  calledAt?: Date;
  calledBy?: Types.ObjectId;
  notes?: string;
}

export interface IAdvancePayment {
  required: boolean;
  amount?: number;
  status: AdvancePaymentStatus;
  transactionRef?: string;
  requestedAt?: Date;
  paidAt?: Date;
}

export interface IStatusHistoryEntry {
  status: OrderStatus;
  changedAt: Date;
  changedBy?: Types.ObjectId;
}

export interface ICourier {
  provider: CourierProvider | null;
  consignmentId?: string;
  trackingId?: string;
  trackingUrl?: string;
  courierStatus?: string;
}

export interface INotificationsSent {
  orderConfirmation?: Date;
  dispatchTracking?: Date;
  deliveryConfirmation?: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  items: IOrderItem[];
  customerId?: Types.ObjectId;
  customer: IOrderCustomer;
  payment: IOrderPayment;
  confirmationCall: IConfirmationCall;
  riskFlags: string[];
  advancePayment: IAdvancePayment;
  orderStatus: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
  courier: ICourier;
  cancelReason?: string;
  notificationsSent: INotificationsSent;
  shippingFee: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: i18nTextSchema, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    ownerName: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [orderItemSchema], required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String },
    },
    payment: {
      method: { type: String, enum: ["COD", "bKash", "Nagad", "Card"], required: true },
      status: {
        type: String,
        enum: ["PENDING", "PAID", "COLLECTED", "REMITTED", "FAILED", "REFUNDED"],
        default: "PENDING",
      },
      transactionRef: { type: String },
      collectedAt: { type: Date },
      remittedAt: { type: Date },
    },
    confirmationCall: {
      status: {
        type: String,
        enum: ["NOT_CALLED", "CONFIRMED", "UNREACHABLE", "ON_HOLD"],
        default: "NOT_CALLED",
      },
      attempts: { type: Number, default: 0 },
      calledAt: { type: Date },
      calledBy: { type: Schema.Types.ObjectId, ref: "User" },
      notes: { type: String },
    },
    riskFlags: { type: [String], default: [] },
    advancePayment: {
      required: { type: Boolean, default: false },
      amount: { type: Number },
      status: {
        type: String,
        enum: ["NOT_REQUIRED", "REQUESTED", "PAID", "WAIVED"],
        default: "NOT_REQUIRED",
      },
      transactionRef: { type: String },
      requestedAt: { type: Date },
      paidAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"],
      default: "PENDING",
    },
    statusHistory: {
      type: [
        new Schema<IStatusHistoryEntry>(
          {
            status: { type: String, required: true },
            changedAt: { type: Date, default: Date.now },
            changedBy: { type: Schema.Types.ObjectId, ref: "User" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    courier: {
      provider: { type: String, enum: ["Steadfast", "Pathao", null], default: null },
      consignmentId: { type: String },
      trackingId: { type: String },
      trackingUrl: { type: String },
      courierStatus: { type: String },
    },
    cancelReason: { type: String },
    notificationsSent: {
      orderConfirmation: { type: Date },
      dispatchTracking: { type: Date },
      deliveryConfirmation: { type: Date },
    },
    shippingFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
  },
  { timestamps: true },
);

orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
