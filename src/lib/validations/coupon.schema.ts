import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase().trim(),
  discountType: z.enum(["PERCENTAGE", "FIXED_BDT"]),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxUses: z.number().nonnegative().optional(),
  expiresAt: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
