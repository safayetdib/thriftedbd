import { z } from "zod";

const i18nTextInput = z.object({
  en: z.string().min(1),
  bn: z.string().optional(),
});

const i18nTextOptionalInput = z.object({
  en: z.string().optional(),
  bn: z.string().optional(),
});

const productImageInput = z.object({
  url: z.string().url(),
  key: z.string().min(1),
  alt: i18nTextOptionalInput.optional(),
  order: z.number().int().optional(),
});

const productSizeInput = z.object({
  type: z.enum(["standard", "measurement", "custom"]),
  standard: z.string().optional(),
  measurements: z
    .object({
      chest: z.number().positive().optional(),
      length: z.number().positive().optional(),
      sleeve: z.number().positive().optional(),
      waist: z.number().positive().optional(),
    })
    .optional(),
  custom: z.string().optional(),
});

export const createProductSchema = z.object({
  // Optional — the slug is auto-generated from the title + a unique code in the
  // service layer. Accepted here only to allow an explicit override if ever set.
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be lowercase, Latin, hyphen-separated")
    .optional(),
  title: i18nTextInput,
  brand: z.string().optional(),
  categoryId: z.string().min(1),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional(),
  // No `.default([])` here deliberately — `.partial()` (used by
  // updateProductSchema) keeps Zod defaults active even when the field is
  // omitted, which would silently wipe `images` on every unrelated PATCH
  // (e.g. a price-only update). Default to [] in the service layer instead,
  // only at creation time.
  images: z.array(productImageInput).optional(),
  size: productSizeInput.optional(),
  colorId: z.string().optional(),
  ownerId: z.string().min(1),
  grade: z.enum(["T", "B", "M", "W", "O"]),
  condition: z.enum(["Excellent", "Good", "Fair"]),
  description: i18nTextOptionalInput.optional(),
  notes: i18nTextOptionalInput.optional(),
  status: z.enum(["DRAFT", "ACTIVE", "SOLD", "ARCHIVED"]).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
