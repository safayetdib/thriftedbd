import mongoose from "mongoose";
import Coupon from "@/models/Coupon";
import type { CreateCouponInput, UpdateCouponInput } from "@/lib/validations/coupon.schema";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function clampLimit(limit?: number) {
  if (!limit || limit < 1) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

export interface ValidateCouponResult {
  valid: boolean;
  code?: string;
  discountAmount?: number;
  error?: string;
}

/**
 * Validate coupon code against an order subtotal.
 * Returns discount amount if valid, error message if not.
 * Does NOT increment usedCount — call redeemCoupon() after order creation.
 */
export async function validateCoupon(
  code: string,
  orderSubtotal: number,
): Promise<ValidateCouponResult> {
  if (!code || typeof code !== "string") {
    return { valid: false, error: "INVALID_CODE" };
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
  });

  if (!coupon) {
    return { valid: false, error: "COUPON_NOT_FOUND" };
  }

  if (!coupon.isActive) {
    return { valid: false, error: "COUPON_INACTIVE" };
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return { valid: false, error: "COUPON_EXPIRED" };
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "COUPON_USED_UP" };
  }

  if (coupon.minOrderAmount && orderSubtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      error: "COUPON_MIN_NOT_MET",
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (orderSubtotal * coupon.discountValue) / 100;
  } else if (coupon.discountType === "FIXED_BDT") {
    discountAmount = coupon.discountValue;
  }

  // Cap discount to order subtotal
  discountAmount = Math.min(discountAmount, orderSubtotal);

  return {
    valid: true,
    code: coupon.code,
    discountAmount,
  };
}

/**
 * Increment usedCount for a coupon.
 * Call this after order is successfully created.
 */
export async function redeemCoupon(code: string) {
  return Coupon.findOneAndUpdate(
    { code: code.toUpperCase().trim() },
    { $inc: { usedCount: 1 } },
    { new: true },
  );
}

/**
 * Admin: get all coupons with pagination.
 */
export async function getAllCoupons(params: { page?: number; limit?: number }) {
  const limit = clampLimit(params.limit);
  const page = params.page && params.page > 0 ? params.page : 1;

  const [items, total] = await Promise.all([
    Coupon.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Coupon.countDocuments({}),
  ]);

  return { items, total, page, limit };
}

/**
 * Admin: create coupon.
 */
export async function createCoupon(input: CreateCouponInput) {
  return Coupon.create(input);
}

/**
 * Admin: update coupon by ID.
 */
export async function updateCoupon(id: string, input: UpdateCouponInput) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Coupon.findByIdAndUpdate(id, input, { new: true });
}

/**
 * Admin: delete coupon by ID.
 */
export async function deleteCoupon(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Coupon.findByIdAndDelete(id);
}

/**
 * Admin: get coupon by ID.
 */
export async function getCouponById(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Coupon.findById(id).lean();
}
