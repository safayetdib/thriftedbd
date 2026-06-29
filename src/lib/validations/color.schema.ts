import { z } from "zod";

const i18nTextInput = z.object({
  en: z.string().min(1),
  bn: z.string().optional(),
});

const hexInput = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "hex must be a 6-digit color code like #1A2B3C")
  .optional();

export const createColorSchema = z.object({
  name: i18nTextInput,
  hex: hexInput,
});

export const updateColorSchema = createColorSchema.partial();

export type CreateColorInput = z.infer<typeof createColorSchema>;
export type UpdateColorInput = z.infer<typeof updateColorSchema>;
