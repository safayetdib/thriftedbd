import Link from "next/link";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  CircleIcon,
  Package,
  Truck,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";

/**
 * Order tracking result page.
 * Shows order status timeline and shipping details.
 */
export default async function TrackOrderResultPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; orderNumber?: string }>;
}) {
  const params = await searchParams;
  const phone = params.phone;
  const orderNumber = params.orderNumber;

  if (!phone || !orderNumber) {
    return (
      <main className="bg-ink-50 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="border-ink-900 shadow-brutal-md w-full max-w-md border-2 bg-white p-8 text-center">
          <p className="text-sale-700 font-semibold">Invalid request</p>
          <p className="text-ink-600 mt-2 text-sm">Missing phone or order number</p>
          <Link href="/track-order" className="mt-4 inline-block">
            <Button variant="primary" size="sm">
              Try again
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  await connectDB();
  const order = await Order.findOne({
    "customer.phone": phone,
    orderNumber,
  }).lean();

  if (!order) {
    return (
      <main className="bg-ink-50 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="border-ink-900 shadow-brutal-md w-full max-w-md border-2 bg-white p-8 text-center">
          <p className="text-sale-700 font-semibold">Order not found</p>
          <p className="text-ink-600 mt-2 text-sm">
            Please check your phone number and order number
          </p>
          <Link href="/track-order" className="mt-4 inline-block">
            <Button variant="primary" size="sm">
              Try again
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const statusSteps = [
    { status: "PENDING", label: "Pending confirmation", icon: CircleIcon },
    { status: "CONFIRMED", label: "Confirmed", icon: CheckCircleIcon },
    { status: "PACKED", label: "Packed", icon: Package },
    { status: "SHIPPED", label: "Shipped", icon: Truck },
    { status: "DELIVERED", label: "Delivered", icon: CheckCircleIcon },
  ];

  const currentStatusIndex = statusSteps.findIndex((s) => s.status === order.orderStatus);

  return (
    <main className="bg-ink-50 flex min-h-screen flex-col gap-6 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="border-ink-900 border-2 bg-white p-6">
          <p className="text-eyebrow text-green-700">thriftedBD</p>
          <h1 className="text-ink-900 mt-2 text-2xl font-extrabold">Order #{order.orderNumber}</h1>
          <p className="text-ink-600 mt-1 text-sm">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="border-ink-900 border-2 bg-white p-6">
          <h2 className="text-ink-900 mb-6 text-lg font-bold">Tracking status</h2>

          <div className="space-y-4">
            {statusSteps.map((step, idx) => {
              const isComplete = idx <= currentStatusIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full p-2 ${isComplete ? "bg-green-500 text-white" : "bg-ink-100 text-ink-500"}`}
                    >
                      <Icon size={20} weight="fill" />
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div
                        className={`my-1 h-8 w-0.5 ${isComplete ? "bg-green-500" : "bg-ink-200"}`}
                      />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <p className={`font-semibold ${isComplete ? "text-ink-900" : "text-ink-600"}`}>
                      {step.label}
                    </p>
                    {step.status === order.orderStatus && (
                      <p className="text-xs font-bold text-green-700">Current status</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="border-ink-900 border-2 bg-white p-6">
          <h2 className="text-ink-900 mb-4 text-lg font-bold">Order details</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-600">Subtotal:</span>
              <span className="text-ink-900 font-semibold">
                ৳{(order.total - order.shippingFee + (order.discountApplied || 0)).toLocaleString()}
              </span>
            </div>

            {order.discountApplied > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-600">Discount:</span>
                <span className="font-semibold text-green-700">-৳{order.discountApplied}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-ink-600">Shipping:</span>
              <span className="text-ink-900 font-semibold">
                ৳{order.shippingFee.toLocaleString()}
              </span>
            </div>

            <div className="border-ink-200 border-t-2 pt-3">
              <div className="flex justify-between">
                <span className="text-ink-900 font-bold">Total:</span>
                <span className="text-ink-900 text-lg font-bold">
                  ৳{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="border-ink-900 border-2 bg-white p-6">
          <h2 className="text-ink-900 mb-4 flex items-center gap-2 text-lg font-bold">
            <MapPin size={20} /> Delivery to
          </h2>

          <div className="text-sm">
            <p className="text-ink-900 font-semibold">{order.customer.name}</p>
            <p className="text-ink-700">{order.customer.phone}</p>
            <p className="text-ink-700">{order.customer.address}</p>
            {order.customer.city && <p className="text-ink-700">{order.customer.city}</p>}
          </div>
        </div>

        {/* Courier Info */}
        {order.courier?.provider && (
          <div className="border-ink-900 border-2 bg-white p-6">
            <h2 className="text-ink-900 mb-4 text-lg font-bold">Shipping information</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-600">Courier:</span>
                <span className="text-ink-900 font-semibold">{order.courier.provider}</span>
              </div>

              {order.courier.trackingId && (
                <div className="flex justify-between">
                  <span className="text-ink-600">Tracking ID:</span>
                  <span className="text-ink-900 font-mono">{order.courier.trackingId}</span>
                </div>
              )}

              {order.courier.trackingUrl && (
                <Link
                  href={order.courier.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-700 hover:underline"
                >
                  View on courier website →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <div className="flex justify-center gap-2">
          <Link href="/track-order">
            <Button variant="secondary" size="sm">
              Track another order
            </Button>
          </Link>
          <Link href="/">
            <Button variant="primary" size="sm">
              Continue shopping
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
