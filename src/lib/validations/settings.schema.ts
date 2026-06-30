import { z } from "zod";

const i18nTextOptionalInput = z.object({
  en: z.string().optional(),
  bn: z.string().optional(),
});

const heroSlideInput = z.object({
  imageUrl: z.string(),
  imageKey: z.string(),
  headline: z.string(),
  subheadline: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  order: z.number().optional(),
  enabled: z.boolean().optional(),
});

const whyBuyBlockInput = z.object({
  icon: z.string(),
  title: i18nTextOptionalInput.optional(),
  description: i18nTextOptionalInput.optional(),
});

const faqItemInput = z.object({
  question: i18nTextOptionalInput.optional(),
  answer: i18nTextOptionalInput.optional(),
  order: z.number().optional(),
});

const homepageInput = z.object({
  heroSlides: z.array(heroSlideInput).optional(),
  featuredProductIds: z.array(z.string()).optional(),
  featuredCategoryIds: z.array(z.string()).optional(),
  whyBuyBlocks: z.array(whyBuyBlockInput).optional(),
  faqs: z.array(faqItemInput).optional(),
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
  homepage: homepageInput.optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
