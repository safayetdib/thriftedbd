import mongoose, { Schema, type Document, type Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface ICustomerAddress {
  label: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export interface ICustomer extends Document {
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  addresses: ICustomerAddress[];
  favoriteProductIds: Types.ObjectId[];
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const customerAddressSchema = new Schema<ICustomerAddress>(
  {
    label: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const customerSchema = new Schema<ICustomer>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addresses: { type: [customerAddressSchema], default: [] },
    favoriteProductIds: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
    emailVerified: { type: Date, default: null },
  },
  { timestamps: true },
);

customerSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", customerSchema);
