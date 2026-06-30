"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  recordConfirmationCall,
  updateAdvancePayment,
  advanceOrderStatus,
  cancelOrder,
} from "@/lib/services/order.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

function fail(orderId: string, message: string): never {
  redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(message)}`);
}

export async function recordConfirmationCallAction(orderId: string, formData: FormData) {
  const session = await requireAdminSession();
  await connectDB();
  try {
    await recordConfirmationCall(
      orderId,
      {
        status: formData.get("status") as "CONFIRMED" | "UNREACHABLE" | "ON_HOLD",
        notes: (formData.get("notes") as string) || undefined,
      },
      session.user.id,
    );
  } catch (err) {
    fail(orderId, err instanceof Error ? err.message : "Failed to record confirmation call");
  }
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function updateAdvancePaymentAction(orderId: string, formData: FormData) {
  await requireAdminSession();
  await connectDB();
  const amount = formData.get("amount");
  try {
    await updateAdvancePayment(orderId, {
      status: formData.get("status") as "REQUESTED" | "PAID" | "WAIVED",
      amount: amount ? Number(amount) : undefined,
      transactionRef: (formData.get("transactionRef") as string) || undefined,
    });
  } catch (err) {
    fail(orderId, err instanceof Error ? err.message : "Failed to update advance payment");
  }
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function advanceOrderStatusAction(orderId: string, formData: FormData) {
  const session = await requireAdminSession();
  await connectDB();
  const provider = formData.get("provider") as string;
  try {
    await advanceOrderStatus(
      orderId,
      {
        status: formData.get("status") as "PACKED" | "SHIPPED" | "DELIVERED",
        courier: provider
          ? {
              provider: provider as "Steadfast" | "Pathao",
              consignmentId: (formData.get("consignmentId") as string) || undefined,
              trackingId: (formData.get("trackingId") as string) || undefined,
              trackingUrl: (formData.get("trackingUrl") as string) || undefined,
            }
          : undefined,
      },
      session.user.id,
    );
  } catch (err) {
    fail(orderId, err instanceof Error ? err.message : "Failed to update order status");
  }
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function cancelOrderAction(orderId: string, formData: FormData) {
  const session = await requireAdminSession();
  await connectDB();
  try {
    await cancelOrder(
      orderId,
      {
        action: formData.get("action") as "CANCELLED" | "RETURNED",
        reason: formData.get("reason") as string,
      },
      session.user.id,
    );
  } catch (err) {
    fail(orderId, err instanceof Error ? err.message : "Failed to cancel/return order");
  }
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
