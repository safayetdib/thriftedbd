import { Schema, model, models } from "mongoose";

const subscriberSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

export default models.Subscriber || model("Subscriber", subscriberSchema);
