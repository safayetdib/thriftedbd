import Color from "@/models/Color";
import type { CreateColorInput, UpdateColorInput } from "@/lib/validations/color.schema";

export async function getActiveColors() {
  return Color.find({ isActive: true }).sort({ "name.en": 1 }).lean();
}

export async function createColor(input: CreateColorInput) {
  return Color.create(input);
}

export async function updateColor(id: string, input: UpdateColorInput) {
  return Color.findByIdAndUpdate(id, input, { new: true });
}

export async function deactivateColor(id: string) {
  return Color.findByIdAndUpdate(id, { isActive: false }, { new: true });
}
