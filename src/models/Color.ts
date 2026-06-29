import mongoose, { Schema, type Document } from "mongoose";
import { i18nTextSchema, type I18nText } from "./shared";

export interface IColor extends Document {
  name: I18nText;
  hex?: string;
  isActive: boolean;
  createdAt: Date;
}

const colorSchema = new Schema<IColor>({
  name: { type: i18nTextSchema, required: true },
  hex: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

colorSchema.index({ "name.en": 1 }, { unique: true });

export default mongoose.models.Color || mongoose.model<IColor>("Color", colorSchema);
