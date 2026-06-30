import mongoose, { Schema, type Document, type Types } from "mongoose";
import { i18nTextOptionalSchema, type I18nTextOptional } from "./shared";

export interface IHeroSlide {
  imageUrl: string;
  imageKey: string;
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  enabled: boolean;
}

export interface IWhyBuyBlock {
  icon: string;
  title: I18nTextOptional;
  description: I18nTextOptional;
}

export interface IFaqItem {
  question: I18nTextOptional;
  answer: I18nTextOptional;
  order: number;
}

export interface IHomepage {
  heroSlides?: IHeroSlide[];
  featuredProductIds?: Types.ObjectId[];
  featuredCategoryIds?: Types.ObjectId[];
  whyBuyBlocks?: IWhyBuyBlock[];
  faqs?: IFaqItem[];
}

export interface ISettings extends Document {
  deliveryFee: {
    insideDhaka: number;
    outsideDhaka: number;
  };
  storeContact: {
    phone: string;
    email: string;
    address: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  announcement?: I18nTextOptional;
  riskThresholds: {
    largeOrderAmount: number;
  };
  homepage?: IHomepage;
  updatedAt: Date;
}

const heroSlideSchema = new Schema<IHeroSlide>(
  {
    imageUrl: { type: String, required: true },
    imageKey: { type: String, required: true },
    headline: { type: String, required: true },
    subheadline: { type: String },
    ctaText: { type: String },
    ctaLink: { type: String },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { _id: false },
);

const whyBuyBlockSchema = new Schema<IWhyBuyBlock>(
  {
    icon: { type: String, required: true },
    title: { type: i18nTextOptionalSchema },
    description: { type: i18nTextOptionalSchema },
  },
  { _id: false },
);

const faqItemSchema = new Schema<IFaqItem>(
  {
    question: { type: i18nTextOptionalSchema },
    answer: { type: i18nTextOptionalSchema },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const homepageSchema = new Schema<IHomepage>(
  {
    heroSlides: { type: [heroSlideSchema], default: [] },
    featuredProductIds: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
    featuredCategoryIds: { type: [Schema.Types.ObjectId], ref: "Category", default: [] },
    whyBuyBlocks: { type: [whyBuyBlockSchema], default: [] },
    faqs: { type: [faqItemSchema], default: [] },
  },
  { _id: false },
);

const settingsSchema = new Schema<ISettings>({
  deliveryFee: {
    insideDhaka: { type: Number, required: true, default: 0 },
    outsideDhaka: { type: Number, required: true, default: 0 },
  },
  storeContact: {
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  socialLinks: {
    facebook: { type: String },
    instagram: { type: String },
    tiktok: { type: String },
    youtube: { type: String },
  },
  announcement: { type: i18nTextOptionalSchema },
  riskThresholds: {
    largeOrderAmount: { type: Number, required: true, default: 5000 },
  },
  homepage: { type: homepageSchema },
  updatedAt: { type: Date, default: Date.now },
});

// Singleton — exactly one document is ever expected, enforced at the
// service layer (find-or-create), not by a unique index on a fixed field.
export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", settingsSchema);
