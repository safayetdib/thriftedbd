import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { ArrowRightIcon, ShoppingBagIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

/**
 * Customer orders history page.
 * Shows all orders for the logged-in customer, sorted by date (newest first).
 */
export default async function AccountOrdersPage() {
  const t = await getTranslations("accountOrders");
  const tEnum = await getTranslations("enums");
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const orders = await Order.find({ customerId: session.user.id }).sort({ createdAt: -1 }).lean();

  const formatDate = (date: Date) => new Date(date).toLocaleDateString();
  const formatPrice = (amount: number) => `৳${amount.toLocaleString()}`;

  const statusColors: Record<string, string> = {
    PENDING: "bg-soft-cloud text-mute",
    CONFIRMED: "bg-soft-cloud text-ink-900",
    PACKED: "bg-soft-cloud text-ink-900",
    SHIPPED: "bg-soft-cloud text-ink-900",
    DELIVERED: "bg-soft-cloud text-success",
    CANCELLED: "bg-soft-cloud text-sale-500",
    RETURNED: "bg-soft-cloud text-sale-500",
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-xl text-ink-900">{t("title")}</h1>
        <p className="text-body-sm text-mute">
          {orders.length === 0 ? t("emptyBlurb") : t("orderCount", { count: orders.length })}
        </p>
      </div>

      {orders.length === 0 && (
        <EmptyState
          icon={<ShoppingBagIcon size={32} />}
          title={t("empty")}
          action={
            <Link href="/products">
              <Button variant="primary" size="sm">
                {t("browseProducts")}
              </Button>
            </Link>
          }
        />
      )}

      {/* Mobile: one card per order - the 700px table below can't shrink. */}
      {orders.length > 0 && (
        <div className="flex flex-col gap-3 md:hidden">
          {orders.map((order) => (
            <div
              key={order._id.toString()}
              className="border-hairline flex flex-col gap-3 rounded-none border bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-caption-md text-ink-900">{order.orderNumber}</p>
                <span
                  className={`rounded-pill text-caption-sm shrink-0 px-2 py-1 ${statusColors[order.orderStatus] || "bg-soft-cloud text-mute"}`}
                >
                  {tEnum(`orderStatus.${order.orderStatus}`)}
                </span>
              </div>
              <div className="text-caption-sm text-mute flex items-center justify-between gap-2">
                <span>
                  {formatDate(order.createdAt)} · {t("itemCount", { count: order.items.length })}
                </span>
                <span className="text-price text-caption-md text-ink-900">
                  {formatPrice(order.total)}
                </span>
              </div>
              <Link
                href={`/track-order?phone=${encodeURIComponent(order.customer.phone)}&orderNumber=${order.orderNumber}`}
              >
                <Button variant="secondary" size="sm" className="w-full">
                  {t("track")} <ArrowRightIcon size={14} />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {orders.length > 0 && (
        <div className="border-hairline hidden overflow-x-auto rounded-none border bg-white md:block">
          <table className="text-body-sm w-full min-w-[700px] text-left">
            <thead className="border-hairline bg-soft-cloud border-b">
              <tr>
                <th className="text-caption-md text-ink-900 px-4 py-3">{t("colOrder")}</th>
                <th className="text-caption-md text-ink-900 px-4 py-3">{t("colDate")}</th>
                <th className="text-caption-md text-ink-900 px-4 py-3">{t("colItems")}</th>
                <th className="text-caption-md text-ink-900 px-4 py-3">{t("colTotal")}</th>
                <th className="text-caption-md text-ink-900 px-4 py-3">{t("colStatus")}</th>
                <th className="text-caption-md text-ink-900 px-4 py-3">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id.toString()} className="border-hairline-soft border-t">
                  <td className="text-caption-md px-4 py-3">{order.orderNumber}</td>
                  <td className="text-caption-sm text-mute px-4 py-3">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="text-price text-caption-md px-4 py-3">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-pill text-caption-sm inline-block px-2 py-1 ${statusColors[order.orderStatus] || "bg-soft-cloud text-mute"}`}
                    >
                      {tEnum(`orderStatus.${order.orderStatus}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/track-order?phone=${encodeURIComponent(order.customer.phone)}&orderNumber=${order.orderNumber}`}
                    >
                      <Button variant="secondary" size="sm">
                        {t("track")} <ArrowRightIcon size={14} />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
