import { z } from "zod";

export const createBlacklistSchema = z.object({
  phone: z.string().min(1),
  name: z.string().optional(),
  reason: z.string().min(1),
  relatedOrderIds: z.array(z.string()).optional(),
});

export const updateBlacklistSchema = z.object({
  reason: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type CreateBlacklistInput = z.infer<typeof createBlacklistSchema>;
export type UpdateBlacklistInput = z.infer<typeof updateBlacklistSchema>;
