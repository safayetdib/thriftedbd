import Owner from "@/models/Owner";
import type { CreateOwnerInput, UpdateOwnerInput } from "@/lib/validations/owner.schema";

export async function getActiveOwners() {
  return Owner.find({ isActive: true }).sort({ name: 1 }).lean();
}

export async function createOwner(input: CreateOwnerInput) {
  return Owner.create(input);
}

export async function updateOwner(id: string, input: UpdateOwnerInput) {
  return Owner.findByIdAndUpdate(id, input, { new: true });
}

export async function deactivateOwner(id: string) {
  return Owner.findByIdAndUpdate(id, { isActive: false }, { new: true });
}
