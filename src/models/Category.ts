import mongoose, { Schema, type Document, type Types } from "mongoose";
import { i18nTextSchema, type I18nText } from "./shared";

export interface ICategory extends Document {
  name: I18nText;
  slug: string;
  parentId: Types.ObjectId | null;
  level: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: i18nTextSchema, required: true },
  slug: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  level: { type: Number, required: true, default: 0 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// One slug per sibling level, not globally unique — see docs/database-schema.md §1.
categorySchema.index({ parentId: 1, slug: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);
