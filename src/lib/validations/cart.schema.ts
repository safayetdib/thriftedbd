import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
