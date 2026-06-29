import { z } from "zod";

const i18nTextInput = z.object({
  en: z.string().min(1),
  bn: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: i18nTextInput,
  slug: z.string().min(1),
  parentId: z.string().nullable().optional(),
  order: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
