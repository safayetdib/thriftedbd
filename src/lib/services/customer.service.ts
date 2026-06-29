import bcrypt from "bcryptjs";
import Customer, { type ICustomerAddress } from "@/models/Customer";
import type {
  SignupInput,
  UpdateProfileInput,
  AddAddressInput,
} from "@/lib/validations/customer.schema";

export async function createCustomer(input: SignupInput) {
  const existing = await Customer.findOne({ email: input.email.toLowerCase() }).lean();
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  return Customer.create({
    email: input.email.toLowerCase(),
    passwordHash,
    name: input.name,
    phone: input.phone,
  });
}

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

function clampLimit(limit?: number) {
  if (!limit || limit < 1) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

export async function getCustomers(params: { page?: number; limit?: number }) {
  const limit = clampLimit(params.limit);
  const page = params.page && params.page > 0 ? params.page : 1;

  const [items, total] = await Promise.all([
    Customer.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Customer.countDocuments(),
  ]);

  return { items, total, page, limit };
}

export async function getCustomerById(id: string) {
  return Customer.findById(id).select("-passwordHash").lean();
}

export async function updateCustomerProfile(id: string, input: UpdateProfileInput) {
  return Customer.findByIdAndUpdate(id, input, { new: true }).select("-passwordHash");
}

export async function addCustomerAddress(id: string, input: AddAddressInput) {
  const customer = await Customer.findById(id);
  if (!customer) throw new Error("CUSTOMER_NOT_FOUND");

  if (input.isDefault) {
    customer.addresses.forEach((address: ICustomerAddress) => {
      address.isDefault = false;
    });
  }
  customer.addresses.push({
    label: input.label,
    address: input.address,
    city: input.city,
    isDefault: input.isDefault ?? customer.addresses.length === 0,
  });
  await customer.save();
  return customer;
}

export async function removeCustomerAddress(id: string, index: number) {
  const customer = await Customer.findById(id);
  if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
  if (index < 0 || index >= customer.addresses.length) {
    throw new Error("ADDRESS_NOT_FOUND");
  }
  customer.addresses.splice(index, 1);
  await customer.save();
  return customer;
}

export async function addFavorite(id: string, productId: string) {
  return Customer.findByIdAndUpdate(
    id,
    { $addToSet: { favoriteProductIds: productId } },
    { new: true },
  ).select("-passwordHash");
}

export async function removeFavorite(id: string, productId: string) {
  return Customer.findByIdAndUpdate(
    id,
    { $pull: { favoriteProductIds: productId } },
    { new: true },
  ).select("-passwordHash");
}
