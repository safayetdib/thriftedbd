import mongoose, { Schema, type Document } from "mongoose";
import { i18nTextOptionalSchema, type I18nTextOptional } from "./shared";

export type PromotionType = "top-bar" | "modal" | "section" | "offer-card";
export type PromotionPage = "homepage" | "plp" | "pdp" | "cart" | "checkout" | "success" | "global";

/**
 * Promotion: Display-only banners scheduled by admin.
 * Examples: "Free shipping over 5000৳", seasonal offers, newsletter signups.
 * Admin controls when they appear, where, and for how long.
 */
export interface IPromotion extends Document {
  type: PromotionType;
  pages: PromotionPage[];
  title: string;
  headline?: I18nTextOptional;
  body?: I18nTextOptional;
  imageUrl?: string;
  imageKey?: string;
  ctaText?: I18nTextOptional;
  ctaLink?: string;
  backgroundColor?: string;
  activeFrom?: Date;
  activeTo?: Date;
  enabled: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    type: {
      type: String,
      enum: ["top-bar", "modal", "section", "offer-card"],
      required: true,
    },
    pages: {
      type: [String],
      enum: ["homepage", "plp", "pdp", "cart", "checkout", "success", "global"],
      required: true,
    },
    title: { type: String, required: true },
    headline: { type: i18nTextOptionalSchema },
    body: { type: i18nTextOptionalSchema },
    imageUrl: { type: String },
    imageKey: { type: String },
    ctaText: { type: i18nTextOptionalSchema },
    ctaLink: { type: String },
    backgroundColor: { type: String },
    activeFrom: { type: Date },
    activeTo: { type: Date },
    enabled: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Index: find active promotions for a page
promotionSchema.index({ pages: 1, enabled: 1, activeFrom: 1, activeTo: 1 });
promotionSchema.index({ enabled: 1, order: 1 });

export default mongoose.models.Promotion ||
  mongoose.model<IPromotion>("Promotion", promotionSchema);
