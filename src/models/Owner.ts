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

// Dev-only: recompile the model when its schema changes. Mongoose caches models
// on the connection singleton, which survives Next.js HMR, so without this a
// schema edit would be masked until a full dev-server restart.
if (process.env.NODE_ENV !== "production" && mongoose.models.Owner) {
  mongoose.deleteModel("Owner");
}

export default mongoose.models.Owner || mongoose.model<IOwner>("Owner", ownerSchema);
