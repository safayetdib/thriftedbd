import Link from "next/link";
import { connectDB } from "@/lib/db";
import { getAdminOrders } from "@/lib/services/order.service";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

const STATUS_BADGE_VARIANT: Record<string, "new" | "sale" | "sold" | "premium"> = {
  PENDING: "sold",
  CONFIRMED: "new",
  PACKED: "premium",
  SHIPPED: "premium",
  DELIVERED: "new",
  CANCELLED: "sale",
  RETURNED: "sale",
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
        <h1 className="text-ink-900 text-2xl font-extrabold">Orders</h1>
        <p className="text-ink-500 text-sm">{total} total</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const isActive = filter === (params.status ?? "All");
          return (
            <Link
              key={filter}
              href={filter === "All" ? "/admin/orders" : `/admin/orders?status=${filter}`}
              className={cn(
                "border-ink-900 border-2 px-3 py-1.5 text-xs font-bold tracking-wide uppercase",
                isActive ? "bg-ink-900 text-white" : "text-ink-900 hover:bg-ink-100 bg-white",
              )}
            >
              {filter}
            </Link>
          );
        })}
      </div>

      <div className="border-ink-900 overflow-x-auto border-2 bg-white">
        <table className="admin-data-table w-full min-w-[840px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Order #</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Customer</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Items</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Total</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Status</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Risk</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Placed</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyTableRow colSpan={7} message="No orders found." />}
            {items.map((order) => (
              <tr
                key={String(order._id)}
                className="border-ink-200 hover:bg-ink-50 border-b transition-colors last:border-0"
              >
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="font-semibold text-green-700 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-ink-900 font-medium">{order.customer.name}</p>
                  <p className="text-ink-500">{order.customer.phone}</p>
                </td>
                <td className="text-ink-700 px-5 py-3.5">{order.items.length}</td>
                <td className="text-ink-900 px-5 py-3.5 font-semibold">৳{order.total}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={STATUS_BADGE_VARIANT[order.orderStatus] ?? "sold"}>
                    {order.orderStatus}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  {order.riskFlags.length > 0 ? (
                    <Badge variant="sale">{order.riskFlags.length} flag(s)</Badge>
                  ) : (
                    <span className="text-ink-400">—</span>
                  )}
                </td>
                <td className="text-ink-500 px-5 py-3.5">
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
