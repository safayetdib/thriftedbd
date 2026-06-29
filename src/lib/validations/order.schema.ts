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

const courierInput = z.object({
  provider: z.enum(["Steadfast", "Pathao"]).optional(),
  consignmentId: z.string().optional(),
  trackingId: z.string().optional(),
  trackingUrl: z.string().optional(),
  courierStatus: z.string().optional(),
});

export const advanceOrderStatusSchema = z.object({
  status: z.enum(["PACKED", "SHIPPED", "DELIVERED"]),
  courier: courierInput.optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ConfirmationCallInput = z.infer<typeof confirmationCallSchema>;
export type AdvancePaymentInput = z.infer<typeof advancePaymentSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type AdvanceOrderStatusInput = z.infer<typeof advanceOrderStatusSchema>;
