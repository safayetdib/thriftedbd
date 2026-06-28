import mongoose, { Schema, type Document, type Types } from "mongoose";
import {
  i18nTextSchema,
  i18nTextOptionalSchema,
  type I18nText,
  type I18nTextOptional,
} from "./shared";

export type ProductGrade = "T" | "B" | "M" | "W" | "O";
export type ProductCondition = "Excellent" | "Good" | "Fair";
export type ProductStatus = "DRAFT" | "ACTIVE" | "SOLD" | "ARCHIVED";

export interface IProductImage {
  url: string;
  key: string;
  alt: I18nTextOptional;
  order: number;
}

export interface IProductSize {
  type: "standard" | "measurement" | "custom";
  standard?: string;
  measurements?: {
    chest?: number;
    length?: number;
    sleeve?: number;
    waist?: number;
  };
  custom?: string;
}

export interface IProduct extends Document {
  sku: string;
  slug: string;
  title: I18nText;
  brand: string;
  categoryId: Types.ObjectId;
  categoryPath: I18nText;
  price: number;
  compareAtPrice?: number;
  images: IProductImage[];
  size: IProductSize;
  colorId: Types.ObjectId;
  color: I18nText;
  ownerId: Types.ObjectId;
  owner: string;
  grade: ProductGrade;
  condition: ProductCondition;
  notes?: I18nTextOptional;
  stock: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
    alt: { type: i18nTextOptionalSchema, default: {} },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const productSizeSchema = new Schema<IProductSize>(
  {
    type: { type: String, enum: ["standard", "measurement", "custom"], required: true },
    standard: { type: String },
    measurements: {
      chest: { type: Number },
      length: { type: Number },
      sleeve: { type: Number },
      waist: { type: Number },
    },
    custom: { type: String },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: i18nTextSchema, required: true },
    brand: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categoryPath: { type: i18nTextSchema, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    images: { type: [productImageSchema], default: [] },
    size: { type: productSizeSchema, required: true },
    colorId: { type: Schema.Types.ObjectId, ref: "Color", required: true },
    color: { type: i18nTextSchema, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    owner: { type: String, required: true },
    grade: { type: String, enum: ["T", "B", "M", "W", "O"], required: true },
    condition: { type: String, enum: ["Excellent", "Good", "Fair"], required: true },
    notes: { type: i18nTextOptionalSchema },
    stock: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "SOLD", "ARCHIVED"],
      default: "DRAFT",
    },
  },
  { timestamps: true },
);

productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ status: 1, categoryId: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
