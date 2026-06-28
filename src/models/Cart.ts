import mongoose, { Schema, type Document, type Types } from "mongoose";
import { i18nTextSchema, type I18nText } from "./shared";

export interface ICartItem {
  productId: Types.ObjectId;
  title: I18nText;
  price: number;
  image: string;
  quantity: number;
  addedAt: Date;
}

export interface ICart extends Document {
  customerId?: Types.ObjectId;
  cartToken?: string;
  items: ICartItem[];
  contactEmail?: string;
  contactPhone?: string;
  lastActivityAt: Date;
  convertedAt: Date | null;
  convertedOrderId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: i18nTextSchema, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const cartSchema = new Schema<ICart>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    cartToken: { type: String },
    items: { type: [cartItemSchema], default: [] },
    contactEmail: { type: String },
    contactPhone: { type: String },
    lastActivityAt: { type: Date, default: Date.now },
    convertedAt: { type: Date, default: null },
    convertedOrderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true },
);

cartSchema.index({ customerId: 1 }, { unique: true, sparse: true });
cartSchema.index({ cartToken: 1 }, { unique: true, sparse: true });
cartSchema.index({ convertedAt: 1, lastActivityAt: -1 });

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);
