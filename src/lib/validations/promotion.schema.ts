import { z } from "zod";

const i18nTextOptionalInput = z.object({
  en: z.string().optional(),
  bn: z.string().optional(),
});

export const createPromotionSchema = z.object({
  type: z.enum(["top-bar", "modal", "section", "offer-card"]),
  pages: z.array(z.enum(["homepage", "plp", "pdp", "cart", "checkout", "success", "global"])),
  title: z.string().min(1),
  headline: i18nTextOptionalInput.optional(),
  body: i18nTextOptionalInput.optional(),
  imageUrl: z.string().url().optional(),
  imageKey: z.string().optional(),
  ctaText: i18nTextOptionalInput.optional(),
  ctaLink: z.string().url().optional(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color like #1A2B3C")
    .optional(),
  activeFrom: z.coerce.date().optional(),
  activeTo: z.coerce.date().optional(),
  enabled: z.boolean().default(false),
  order: z.number().int().nonnegative().default(0),
});

export const updatePromotionSchema = createPromotionSchema.partial();

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
