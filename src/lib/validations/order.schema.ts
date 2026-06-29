import { z } from "zod";

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().optional(),
  }),
  payment: z.object({
    method: z.enum(["COD", "bKash", "Nagad", "Card"]),
    transactionRef: z.string().optional(),
  }),
});

export const confirmationCallSchema = z.object({
  status: z.enum(["CONFIRMED", "UNREACHABLE", "ON_HOLD"]),
  notes: z.string().optional(),
});

export const advancePaymentSchema = z.object({
  status: z.enum(["REQUESTED", "PAID", "WAIVED"]),
  amount: z.number().positive().optional(),
  transactionRef: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  action: z.enum(["CANCELLED", "RETURNED"]),
  reason: z.string().min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ConfirmationCallInput = z.infer<typeof confirmationCallSchema>;
export type AdvancePaymentInput = z.infer<typeof advancePaymentSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
