import { z } from "zod";

const i18nTextOptionalInput = z.object({
  en: z.string().optional(),
  bn: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  deliveryFee: z
    .object({
      insideDhaka: z.number().nonnegative(),
      outsideDhaka: z.number().nonnegative(),
    })
    .partial()
    .optional(),
  storeContact: z
    .object({
      phone: z.string(),
      email: z.string().email(),
      address: z.string(),
    })
    .partial()
    .optional(),
  socialLinks: z
    .object({
      facebook: z.string().url(),
      instagram: z.string().url(),
      tiktok: z.string().url(),
      youtube: z.string().url(),
    })
    .partial()
    .optional(),
  announcement: i18nTextOptionalInput.optional(),
  riskThresholds: z
    .object({
      largeOrderAmount: z.number().nonnegative(),
    })
    .partial()
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
