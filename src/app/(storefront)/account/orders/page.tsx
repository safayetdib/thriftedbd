import Link from "next/link";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * Customer orders history page.
 * Shows all orders for the logged-in customer, sorted by date (newest first).
 */
export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const orders = await Order.find({ customerId: session.user.id }).sort({ createdAt: -1 }).lean();

  const formatDate = (date: Date) => new Date(date).toLocaleDateString();
  const formatPrice = (amount: number) => `৳${amount.toLocaleString()}`;

  const statusColors: Record<string, string> = {
    PENDING: "bg-ink-100 text-ink-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PACKED: "bg-purple-100 text-purple-700",
    SHIPPED: "bg-yellow-100 text-yellow-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-sale-100 text-sale-700",
    RETURNED: "bg-sale-100 text-sale-700",
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink-900 text-2xl font-extrabold">Order history</h1>
        <p className="text-ink-600 text-sm">
          {orders.length === 0
            ? "You haven't placed any orders yet."
            : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {orders.length === 0 && (
        <div className="border-ink-900 flex flex-col items-center gap-4 border-2 bg-white p-8 text-center">
          <p className="text-ink-700">No orders yet. Start shopping!</p>
          <Link href="/products">
            <Button variant="primary" size="sm">
              Browse products
            </Button>
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="border-ink-900 overflow-x-auto border-2 bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-ink-900 bg-ink-100 border-b-2">
              <tr>
                <th className="text-ink-900 px-4 py-3 font-bold">Order #</th>
                <th className="text-ink-900 px-4 py-3 font-bold">Date</th>
                <th className="text-ink-900 px-4 py-3 font-bold">Items</th>
                <th className="text-ink-900 px-4 py-3 font-bold">Total</th>
                <th className="text-ink-900 px-4 py-3 font-bold">Status</th>
                <th className="text-ink-900 px-4 py-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id.toString()} className="border-ink-900 border-t-2">
                  <td className="px-4 py-3 font-semibold">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-pill inline-block px-2 py-1 text-xs font-semibold ${statusColors[order.orderStatus] || "bg-ink-100 text-ink-700"}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/track-order?phone=${encodeURIComponent(order.customer.phone)}&orderNumber=${order.orderNumber}`}
                    >
                      <Button variant="secondary" size="sm">
                        Track <ArrowRightIcon size={14} />
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
