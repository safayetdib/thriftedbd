"use server";

import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

/**
 * Track order action.
 * Finds order by phone + orderNumber, redirects to results page.
 */
export async function trackOrderAction(_prevState: string | undefined, formData: FormData) {
  const phone = formData.get("phone") as string;
  const orderNumber = formData.get("orderNumber") as string;

  if (!phone || !orderNumber) {
    return "Please enter both phone and order number";
  }

  await connectDB();
  const order = await Order.findOne({
    "customer.phone": phone,
    orderNumber,
  }).lean();

  if (!order) {
    return "Order not found. Please check your phone number and order number.";
  }

  // Redirect to results page with order data (encoded in URL)
  const encodedPhone = encodeURIComponent(phone);
  const encodedOrderNumber = encodeURIComponent(orderNumber);
  redirect(`/track-order/result?phone=${encodedPhone}&orderNumber=${encodedOrderNumber}`);
}
