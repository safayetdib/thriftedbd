import mongoose from "mongoose";
import Promotion from "@/models/Promotion";
import type { PromotionPage } from "@/models/Promotion";
import type {
  CreatePromotionInput,
  UpdatePromotionInput,
} from "@/lib/validations/promotion.schema";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function clampLimit(limit?: number) {
  if (!limit || limit < 1) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

/**
 * Get active promotions for given page(s).
 * Filters by enabled status and date range (activeFrom/activeTo).
 * Sorted by order and creation date.
 */
export async function getActivePromotions(pages: PromotionPage[]) {
  const now = new Date();
  return Promotion.find({
    enabled: true,
    pages: { $in: pages },
    $or: [
      { activeFrom: { $lte: now }, activeTo: { $gte: now } },
      { activeFrom: { $lte: now }, activeTo: null },
      { activeFrom: null, activeTo: { $gte: now } },
      { activeFrom: null, activeTo: null },
    ],
  })
    .sort({ order: 1, createdAt: -1 })
    .lean();
}

/**
 * Admin: get all promotions with pagination.
 */
export async function getAllPromotions(params: { page?: number; limit?: number }) {
  const limit = clampLimit(params.limit);
  const page = params.page && params.page > 0 ? params.page : 1;

  const [items, total] = await Promise.all([
    Promotion.find({})
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Promotion.countDocuments({}),
  ]);

  return { items, total, page, limit };
}

/**
 * Admin: create promotion.
 */
export async function createPromotion(input: CreatePromotionInput) {
  return Promotion.create(input);
}

/**
 * Admin: update promotion by ID.
 */
export async function updatePromotion(id: string, input: UpdatePromotionInput) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Promotion.findByIdAndUpdate(id, input, { new: true });
}

/**
 * Admin: delete promotion by ID.
 */
export async function deletePromotion(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Promotion.findByIdAndDelete(id);
}

/**
 * Admin: get promotion by ID.
 */
export async function getPromotionById(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Promotion.findById(id).lean();
}
