import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["COD_REMITTANCE", "ONLINE_PAYMENT", "ADVANCE_PAYMENT", "REFUND"]),
  amount: z.number().positive(),
  method: z.enum(["bKash", "Nagad", "Bank", "Cash"]),
  reference: z.string().optional(),
  orderIds: z.array(z.string().min(1)).min(1),
  courierProvider: z.enum(["Steadfast", "Pathao"]).optional(),
  notes: z.string().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
