import Color from "@/models/Color";
import type { CreateColorInput, UpdateColorInput } from "@/lib/validations/color.schema";

export async function getAllColors() {
  return Color.find().sort({ "name.en": 1 }).lean();
}

export async function createColor(input: CreateColorInput) {
  return Color.create(input);
}

export async function updateColor(id: string, input: UpdateColorInput) {
  return Color.findByIdAndUpdate(id, input, { new: true });
}
