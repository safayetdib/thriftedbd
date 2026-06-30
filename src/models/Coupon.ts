import mongoose, { Schema, type Document } from "mongoose";

export type DiscountType = "PERCENTAGE" | "FIXED_BDT";

/**
 * Coupon: Discount code that customers apply at checkout.
 * Admin can set expiry, usage limit, and minimum order amount.
 * usedCount tracks redemptions; admin monitors against maxUses.
 */
export interface ICoupon extends Document {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["PERCENTAGE", "FIXED_BDT"], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number },
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Index: look up by code
couponSchema.index({ code: 1 });
// Index: find active coupons not yet expired
couponSchema.index({ isActive: 1, expiresAt: 1 });

export default mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", couponSchema);
