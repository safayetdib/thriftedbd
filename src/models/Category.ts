import mongoose, { Schema, type Document, type Types } from "mongoose";
import { i18nTextSchema, type I18nText } from "./shared";

export interface ICategory extends Document {
  name: I18nText;
  slug: string;
  parentId: Types.ObjectId | null;
  level: number;
  order: number;
  isActive: boolean;
  coverImage?: { url: string; key: string };
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: i18nTextSchema, required: true },
  slug: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  level: { type: Number, required: true, default: 0 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  coverImage: {
    type: { url: String, key: String },
    _id: false,
    default: undefined,
  },
  createdAt: { type: Date, default: Date.now },
});

// One slug per sibling level, not globally unique - see docs/database-schema.md §1.
categorySchema.index({ parentId: 1, slug: 1 }, { unique: true });

// Dev-only: recompile the model when its schema changes. Mongoose caches models
// on the connection singleton, which survives Next.js HMR, so without this a
// schema edit would be masked until a full dev-server restart.
if (process.env.NODE_ENV !== "production" && mongoose.models.Category) {
  mongoose.deleteModel("Category");
}

export default mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);
