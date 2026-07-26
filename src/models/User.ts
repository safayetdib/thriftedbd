import mongoose, { Schema, type Document } from "mongoose";
import bcrypt from "bcryptjs";

export type AdminRole = "admin" | "superadmin";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  // "superadmin" additionally manages other admin users; "admin" cannot.
  role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Dev-only: recompile the model when its schema changes. Mongoose caches models
// on the connection singleton, which survives Next.js HMR, so without this a
// schema edit would be masked until a full dev-server restart.
if (process.env.NODE_ENV !== "production" && mongoose.models.User) {
  mongoose.deleteModel("User");
}

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);
