import mongoose, { Schema, type Document } from "mongoose";
import { i18nTextOptionalSchema, type I18nTextOptional } from "./shared";

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
  updatedAt: Date;
}

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
  updatedAt: { type: Date, default: Date.now },
});

// Singleton — exactly one document is ever expected, enforced at the
// service layer (find-or-create), not by a unique index on a fixed field.
export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", settingsSchema);
