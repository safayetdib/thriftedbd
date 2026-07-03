"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

/**
 * Track order action.
 * Finds order by phone + orderNumber, redirects to results page.
 */
export async function trackOrderAction(_prevState: string | undefined, formData: FormData) {
  const t = await getTranslations("trackOrder");
  const locale = await getLocale();
  const phone = formData.get("phone") as string;
  const orderNumber = formData.get("orderNumber") as string;

  if (!phone || !orderNumber) {
    return t("missingFields");
  }

  await connectDB();
  const order = await Order.findOne({
    "customer.phone": phone,
    orderNumber,
  }).lean();

  if (!order) {
    return t("notFoundLong");
  }

  // Redirect to results page with order data (encoded in URL)
  const encodedPhone = encodeURIComponent(phone);
  const encodedOrderNumber = encodeURIComponent(orderNumber);
  redirect({
    href: `/track-order/result?phone=${encodedPhone}&orderNumber=${encodedOrderNumber}`,
    locale,
  });
}
