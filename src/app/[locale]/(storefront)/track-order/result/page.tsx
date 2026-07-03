import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
  const t = await getTranslations("trackOrder");
  const tEnum = await getTranslations("enums");

  if (!phone || !orderNumber) {
    return (
      <main className="bg-ink-50 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="border-ink-900 shadow-brutal-md w-full max-w-md border-2 bg-white p-8 text-center">
          <p className="text-sale-700 font-semibold">{t("invalidRequest")}</p>
          <p className="text-ink-600 mt-2 text-sm">{t("missingFields")}</p>
          <Link href="/track-order" className="mt-4 inline-block">
            <Button variant="primary" size="sm">
              {t("tryAgain")}
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
          <p className="text-sale-700 font-semibold">{t("notFound")}</p>
          <p className="text-ink-600 mt-2 text-sm">{t("checkDetails")}</p>
          <Link href="/track-order" className="mt-4 inline-block">
            <Button variant="primary" size="sm">
              {t("tryAgain")}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const statusSteps = [
    { status: "PENDING", label: tEnum("orderStatus.PENDING"), icon: CircleIcon },
    { status: "CONFIRMED", label: tEnum("orderStatus.CONFIRMED"), icon: CheckCircleIcon },
    { status: "PACKED", label: tEnum("orderStatus.PACKED"), icon: Package },
    { status: "SHIPPED", label: tEnum("orderStatus.SHIPPED"), icon: Truck },
    { status: "DELIVERED", label: tEnum("orderStatus.DELIVERED"), icon: CheckCircleIcon },
  ];

  const currentStatusIndex = statusSteps.findIndex((s) => s.status === order.orderStatus);

  return (
    <main className="bg-ink-50 flex min-h-screen flex-col gap-6 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="border-ink-900 border-2 bg-white p-6">
          <p className="text-eyebrow text-green-700">thriftedBD</p>
          <h1 className="text-ink-900 mt-2 text-2xl font-extrabold">
            {t("orderHeading", { number: order.orderNumber })}
          </h1>
          <p className="text-ink-600 mt-1 text-sm">
            {t("placedOn", { date: new Date(order.createdAt).toLocaleDateString() })}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="border-ink-900 border-2 bg-white p-6">
          <h2 className="text-ink-900 mb-6 text-lg font-bold">{t("trackingStatus")}</h2>

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
                      <p className="text-xs font-bold text-green-700">{t("currentStatus")}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="border-ink-900 border-2 bg-white p-6">
          <h2 className="text-ink-900 mb-4 text-lg font-bold">{t("orderDetails")}</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-600">{t("subtotal")}:</span>
              <span className="text-ink-900 font-semibold">
                ৳{(order.total - order.shippingFee + (order.discountApplied || 0)).toLocaleString()}
              </span>
            </div>

            {order.discountApplied > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-600">{t("discount")}:</span>
                <span className="font-semibold text-green-700">-৳{order.discountApplied}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-ink-600">{t("shipping")}:</span>
              <span className="text-ink-900 font-semibold">
                ৳{order.shippingFee.toLocaleString()}
              </span>
            </div>

            <div className="border-ink-200 border-t-2 pt-3">
              <div className="flex justify-between">
                <span className="text-ink-900 font-bold">{t("total")}:</span>
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
            <MapPin size={20} /> {t("deliveryTo")}
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
            <h2 className="text-ink-900 mb-4 text-lg font-bold">{t("shippingInfo")}</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-600">{t("courier")}:</span>
                <span className="text-ink-900 font-semibold">{order.courier.provider}</span>
              </div>

              {order.courier.trackingId && (
                <div className="flex justify-between">
                  <span className="text-ink-600">{t("trackingId")}:</span>
                  <span className="text-ink-900 font-mono">{order.courier.trackingId}</span>
                </div>
              )}

              {order.courier.trackingUrl && (
                <a
                  href={order.courier.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-700 hover:underline"
                >
                  {t("viewOnCourier")} →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <div className="flex justify-center gap-2">
          <Link href="/track-order">
            <Button variant="secondary" size="sm">
              {t("trackAnother")}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="primary" size="sm">
              {t("continueShopping")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
