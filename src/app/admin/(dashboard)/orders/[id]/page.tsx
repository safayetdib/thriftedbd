import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getOrderById } from "@/lib/services/order.service";
import type { IOrderItem, IStatusHistoryEntry } from "@/models/Order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import {
  recordConfirmationCallAction,
  updateAdvancePaymentAction,
  advanceOrderStatusAction,
  cancelOrderAction,
} from "./actions";

const FULFILLMENT_STAGES = ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];
const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-ink-900 border-2 bg-white p-5">
      <h2 className="text-eyebrow text-ink-500 mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  await connectDB();
  const order = await getOrderById(id);
  if (!order) notFound();

  const orderId = String(order._id);
  const stageIndex = FULFILLMENT_STAGES.indexOf(order.orderStatus);
  const nextStage =
    stageIndex >= 0 && stageIndex < FULFILLMENT_STAGES.length - 1
      ? FULFILLMENT_STAGES[stageIndex + 1]
      : null;
  const advancePaymentSatisfied =
    !order.advancePayment.required || ["PAID", "WAIVED"].includes(order.advancePayment.status);
  const advancePaymentSatisfiedNote = advancePaymentSatisfied
    ? "This confirms the order and immediately decrements stock on every item — the product(s) will be marked SOLD."
    : "This marks the call as confirmed, but the order won't move to CONFIRMED yet since advance payment is still required.";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/orders"
        className="text-ink-700 hover:text-ink-900 flex items-center gap-1.5 text-sm font-semibold"
      >
        <ArrowLeftIcon size={14} /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink-900 text-2xl font-extrabold">{order.orderNumber}</h1>
          <p className="text-ink-500 text-sm">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="premium">{order.orderStatus}</Badge>
          <span className="text-ink-900 text-xl font-extrabold">৳{order.total}</span>
        </div>
      </div>

      {error && (
        <p className="border-sale-500 bg-sale-50 text-sale-700 border-2 px-4 py-3 text-sm font-medium">
          {error}
        </p>
      )}

      {order.riskFlags.length > 0 && (
        <div className="border-sale-500 bg-sale-50 flex flex-wrap gap-2 border-2 p-4">
          {order.riskFlags.map((flag: string) => (
            <Badge key={flag} variant="sale">
              {flag}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Items">
          <ul className="flex flex-col gap-3">
            {order.items.map((item: IOrderItem, i: number) => (
              <li key={i} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="text-ink-900 font-semibold">{item.title.en}</p>
                  <p className="text-ink-500">Owner: {item.ownerName}</p>
                </div>
                <p className="text-ink-900 font-semibold">
                  ৳{item.price} × {item.quantity}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-ink-200 mt-4 flex justify-between border-t-2 pt-3 text-sm">
            <span className="text-ink-500">Shipping fee</span>
            <span className="text-ink-900 font-semibold">৳{order.shippingFee}</span>
          </div>
        </Section>

        <Section title="Customer">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Name</dt>
              <dd className="text-ink-900 font-semibold">{order.customer.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Phone</dt>
              <dd className="text-ink-900 font-semibold">{order.customer.phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Address</dt>
              <dd className="text-ink-900 text-right font-semibold">{order.customer.address}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">City</dt>
              <dd className="text-ink-900 font-semibold">{order.customer.city ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Payment method</dt>
              <dd className="text-ink-900 font-semibold">{order.payment.method}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Payment status</dt>
              <dd className="text-ink-900 font-semibold">{order.payment.status}</dd>
            </div>
          </dl>
        </Section>

        {order.orderStatus === "PENDING" && (
          <Section title="Confirmation call">
            <p className="text-ink-500 mb-3 text-sm">
              Current:{" "}
              <span className="text-ink-900 font-semibold">{order.confirmationCall.status}</span> (
              {order.confirmationCall.attempts} attempt(s))
            </p>
            <ConfirmableForm
              action={recordConfirmationCallAction.bind(null, orderId)}
              className="flex flex-col gap-3"
              title="Record this confirmation call?"
              description={`Confirmed: ${advancePaymentSatisfiedNote} Unreachable/On hold: just logs the call, the order stays PENDING.`}
            >
              <div className="flex gap-2">
                <Button type="submit" name="status" value="CONFIRMED" variant="primary" size="sm">
                  Confirmed
                </Button>
                <Button type="submit" name="status" value="UNREACHABLE" variant="outline" size="sm">
                  Unreachable
                </Button>
                <Button type="submit" name="status" value="ON_HOLD" variant="outline" size="sm">
                  On hold
                </Button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input id="notes" name="notes" placeholder="Call notes…" />
              </div>
            </ConfirmableForm>
          </Section>
        )}

        {order.advancePayment.required && order.orderStatus === "PENDING" && (
          <Section title="Advance payment">
            <p className="text-ink-500 mb-3 text-sm">
              Status:{" "}
              <span className="text-ink-900 font-semibold">{order.advancePayment.status}</span>
              {order.advancePayment.amount ? ` · ৳${order.advancePayment.amount}` : ""}
            </p>
            <ConfirmableForm
              action={updateAdvancePaymentAction.bind(null, orderId)}
              className="flex flex-col gap-3"
              title="Update advance payment status?"
              description={
                order.confirmationCall.status === "CONFIRMED"
                  ? "Setting this to Paid satisfies the advance payment requirement and, since the confirmation call is already CONFIRMED, immediately confirms the order and decrements stock."
                  : "This updates the advance payment status."
              }
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="amount">Amount (৳)</Label>
                  <Input id="amount" name="amount" type="number" min="0" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="transactionRef">Transaction ref</Label>
                  <Input id="transactionRef" name="transactionRef" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" name="status" value="REQUESTED" variant="outline" size="sm">
                  Requested
                </Button>
                <Button type="submit" name="status" value="PAID" variant="primary" size="sm">
                  Paid
                </Button>
                <Button type="submit" name="status" value="WAIVED" variant="outline" size="sm">
                  Waive
                </Button>
              </div>
            </ConfirmableForm>
          </Section>
        )}

        {nextStage && (
          <Section title="Fulfillment">
            <p className="text-ink-500 mb-3 text-sm">
              {advancePaymentSatisfied
                ? `Move this order to the next stage: ${nextStage}.`
                : "Confirmation call and/or advance payment still pending — order is not yet CONFIRMED."}
            </p>
            {order.courier.provider && (
              <p className="text-ink-700 mb-3 text-sm">
                Courier: <span className="font-semibold">{order.courier.provider}</span>
                {order.courier.trackingUrl && (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={order.courier.trackingUrl}
                      className="text-green-700 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Tracking link
                    </a>
                  </>
                )}
              </p>
            )}
            {order.orderStatus !== "PENDING" && (
              <ConfirmableForm
                action={advanceOrderStatusAction.bind(null, orderId)}
                className="flex flex-col gap-3"
                title={`Mark this order as ${nextStage}?`}
                description={
                  nextStage === "DELIVERED"
                    ? "This is the final fulfillment stage — make sure delivery is actually confirmed."
                    : `This moves the order one stage forward. It can't be reversed from here.`
                }
              >
                <input type="hidden" name="status" value={nextStage} />
                {nextStage === "SHIPPED" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="provider">Courier</Label>
                      <select
                        id="provider"
                        name="provider"
                        className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
                      >
                        <option value="">— Select —</option>
                        <option value="Steadfast">Steadfast</option>
                        <option value="Pathao">Pathao</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="consignmentId">Consignment ID</Label>
                      <Input id="consignmentId" name="consignmentId" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="trackingId">Tracking ID</Label>
                      <Input id="trackingId" name="trackingId" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="trackingUrl">Tracking URL</Label>
                      <Input id="trackingUrl" name="trackingUrl" />
                    </div>
                  </div>
                )}
                <Button type="submit" variant="primary" size="sm" className="w-fit">
                  Mark as {nextStage}
                </Button>
              </ConfirmableForm>
            )}
          </Section>
        )}

        {CANCELLABLE_STATUSES.includes(order.orderStatus) && (
          <Section title="Cancel / return">
            <ConfirmableForm
              action={cancelOrderAction.bind(null, orderId)}
              className="flex flex-col gap-3"
              title="Cancel or return this order?"
              confirmVariant="destructive"
              description={
                order.orderStatus !== "PENDING"
                  ? "This cancels or returns the order and restores stock on every item back to ACTIVE. This can't be undone from here."
                  : "This cancels or returns the order. This can't be undone from here."
              }
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reason">Reason</Label>
                <Input id="reason" name="reason" required />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  name="action"
                  value="CANCELLED"
                  variant="destructive"
                  size="sm"
                >
                  Cancel order
                </Button>
                <Button type="submit" name="action" value="RETURNED" variant="outline" size="sm">
                  Mark returned
                </Button>
              </div>
            </ConfirmableForm>
          </Section>
        )}

        <Section title="Status history">
          <ol className="flex flex-col gap-2 text-sm">
            {order.statusHistory.map((entry: IStatusHistoryEntry, i: number) => (
              <li
                key={i}
                className="border-ink-200 flex justify-between border-b pb-2 last:border-0"
              >
                <span className="text-ink-900 font-semibold">{entry.status}</span>
                <span className="text-ink-500">{new Date(entry.changedAt).toLocaleString()}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </div>
  );
}
