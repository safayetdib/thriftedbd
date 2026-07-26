import Link from "next/link";
import { connectDB } from "@/lib/db";
import { getAdminOrders } from "@/lib/services/order.service";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/admin/pagination";
import { EmptyTableRow } from "@/components/ui/empty-state";

const STATUS_FILTERS = [
  "All",
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

/**
 * Admin status chips are semantic, not decorative: soft-cloud is the default
 * ground and only the label colour carries meaning — green for a settled
 * success state, pale amber for "needs a human", pale red for a terminal
 * failure, grey for dormant. Nothing here is a solid fill; solid ink is
 * reserved for actionable surfaces (active filter chip, primary button).
 */
const STATUS_CHIP: Record<string, string> = {
  PENDING: "bg-amber-50 text-ink-900",
  CONFIRMED: "bg-soft-cloud text-success",
  PACKED: "bg-soft-cloud text-ink-900",
  SHIPPED: "bg-soft-cloud text-ink-900",
  DELIVERED: "bg-soft-cloud text-success",
  CANCELLED: "bg-sale-50 text-sale-700",
  RETURNED: "bg-sale-50 text-sale-700",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status && params.status !== "All" ? params.status : undefined;
  const page = Number(params.page) || 1;

  await connectDB();
  const { items, total, limit } = await getAdminOrders({ status, page, limit: 24 });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-heading-lg">Orders</h1>
        <p className="text-mute text-body-sm">{total} total</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const isActive = filter === (params.status ?? "All");
          return (
            <Link
              key={filter}
              href={filter === "All" ? "/admin/orders" : `/admin/orders?status=${filter}`}
              className={`text-caption-sm text-eyebrow rounded-pill border px-4 py-1.5 transition-colors ${
                isActive
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-hairline text-charcoal hover:bg-soft-cloud hover:text-ink-900 bg-white"
              }`}
            >
              {filter}
            </Link>
          );
        })}
      </div>

      <div className="border-hairline overflow-x-auto rounded-none border bg-white">
        <table className="admin-data-table text-body-sm w-full min-w-[840px] text-left">
          <thead className="border-hairline bg-soft-cloud border-b">
            <tr>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Order #</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Customer</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Items</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Total</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Status</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Risk</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Placed</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyTableRow colSpan={7} message="No orders found." />}
            {items.map((order) => (
              <tr
                key={String(order._id)}
                className="border-hairline-soft hover:bg-soft-cloud border-b transition-colors last:border-0"
              >
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="text-ink-900 text-body-sm-strong hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-ink-900 text-body-sm-strong">{order.customer.name}</p>
                  <p className="text-mute">{order.customer.phone}</p>
                </td>
                <td className="text-charcoal px-5 py-3.5">{order.items.length}</td>
                <td className="text-ink-900 text-body-sm-strong px-5 py-3.5">৳{order.total}</td>
                <td className="px-5 py-3.5">
                  <Badge className={STATUS_CHIP[order.orderStatus] ?? "bg-soft-cloud text-mute"}>
                    {order.orderStatus}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  {order.riskFlags.length > 0 ? (
                    <Badge className="bg-sale-50 text-sale-700">
                      {order.riskFlags.length} flag(s)
                    </Badge>
                  ) : (
                    <span className="text-stone">—</span>
                  )}
                </td>
                <td className="text-mute px-5 py-3.5">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/orders"
        params={{ status: params.status }}
      />
    </div>
  );
}
