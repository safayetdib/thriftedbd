import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IBlacklist extends Document {
  phone: string;
  name?: string;
  reason: string;
  relatedOrderIds: Types.ObjectId[];
  isActive: boolean;
  addedBy: Types.ObjectId;
  createdAt: Date;
}

const blacklistSchema = new Schema<IBlacklist>({
  phone: { type: String, required: true, unique: true },
  name: { type: String },
  reason: { type: String, required: true },
  relatedOrderIds: { type: [Schema.Types.ObjectId], ref: "Order", default: [] },
  isActive: { type: Boolean, default: true },
  addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Blacklist ||
  mongoose.model<IBlacklist>("Blacklist", blacklistSchema);
