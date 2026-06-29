import { z } from "zod";

export const createOwnerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
});

export const updateOwnerSchema = createOwnerSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>;
