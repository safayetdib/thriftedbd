import Blacklist from "@/models/Blacklist";
import type {
  CreateBlacklistInput,
  UpdateBlacklistInput,
} from "@/lib/validations/blacklist.schema";

export async function getBlacklist(params: { isActive?: boolean }) {
  const filter: Record<string, unknown> = {};
  if (params.isActive !== undefined) filter.isActive = params.isActive;
  return Blacklist.find(filter).sort({ createdAt: -1 }).lean();
}

export async function createBlacklistEntry(input: CreateBlacklistInput, addedBy: string) {
  return Blacklist.create({ ...input, addedBy });
}

export async function updateBlacklistEntry(id: string, input: UpdateBlacklistInput) {
  return Blacklist.findByIdAndUpdate(id, input, { new: true });
}

export async function deactivateBlacklistEntry(id: string) {
  return Blacklist.findByIdAndUpdate(id, { isActive: false }, { new: true });
}
