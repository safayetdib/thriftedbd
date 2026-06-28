import mongoose, { Schema, type Document } from "mongoose";

export interface IOwner extends Document {
  name: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
}

const ownerSchema = new Schema<IOwner>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Owner || mongoose.model<IOwner>("Owner", ownerSchema);
