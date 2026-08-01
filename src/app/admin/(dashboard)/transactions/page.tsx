import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { AdminPagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyTableRow } from "@/components/ui/empty-state";
import { connectDB } from "@/lib/db";
import { getTransactions } from "@/lib/services/transaction.service";
import { CheckCircleIcon, PlusIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import {
  createTransactionAction,
  reconcileTransactionAction,
  voidTransactionAction,
} from "./actions";

const STATUS_FILTERS = ["All", "PENDING", "RECEIVED", "RECONCILED"] as const;

/** See the note on STATUS_CHIP in the orders list - same semantic ramp. */
const STATUS_CHIP: Record<string, string> = {
  PENDING: "bg-amber-50 text-ink-900",
  RECEIVED: "bg-soft-cloud text-ink-900",
  RECONCILED: "bg-soft-cloud text-success",
};

const CREATE_FIELDS: EntityField[] = [
  {
    name: "type",
    label: "Type",
    type: "select",
    options: ["COD_REMITTANCE", "ONLINE_PAYMENT", "ADVANCE_PAYMENT", "REFUND"],
    required: true,
  },
  { name: "amount", label: "Amount (৳)", type: "number", required: true },
  {
    name: "method",
    label: "Method",
    type: "select",
    options: ["bKash", "Nagad", "Bank", "Cash"],
    required: true,
  },
  { name: "reference", label: "Reference (optional)" },
  { name: "orderIds", label: "Order IDs (comma-separated)", type: "csv", required: true },
  {
    name: "courierProvider",
    label: "Courier (optional)",
    type: "select",
    options: ["Steadfast", "Pathao"],
  },
];

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status && params.status !== "All" ? params.status : undefined;
  const page = Number(params.page) || 1;

  await connectDB();
  const { items, total, limit } = await getTransactions({ status, page, limit: 24 });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-heading-lg">Transactions</h1>
        <EntityFormDialog
          trigger={
            <Button variant="primary" size="sm">
              <PlusIcon size={16} /> New transaction
            </Button>
          }
          title="Record a transaction"
          fields={CREATE_FIELDS}
          onSubmit={createTransactionAction}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const isActive = filter === (params.status ?? "All");
          return (
            <Link
              key={filter}
              href={
                filter === "All" ? "/admin/transactions" : `/admin/transactions?status=${filter}`
              }
              className={`text-caption-sm text-eyebrow rounded-pill border px-4 py-1.5 transition-colors ${
                isActive
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-hairline text-charcoal hover:bg-soft-cloud hover:text-ink-900 bg-white"
              }`}
              prefetch={false}
            >
              {filter}
            </Link>
          );
        })}
      </div>

      <div className="border-hairline overflow-x-auto rounded-none border bg-white">
        <table className="admin-data-table text-body-sm w-full min-w-[760px] text-left">
          <thead className="border-hairline bg-soft-cloud border-b">
            <tr>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Type</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Amount</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Method</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Orders</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Status</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyTableRow colSpan={6} message="No transactions found." />}
            {items.map((tx) => (
              <tr
                key={String(tx._id)}
                className="border-hairline-soft hover:bg-soft-cloud border-b transition-colors last:border-0"
              >
                <td className="text-ink-900 text-body-sm-strong px-5 py-3.5">{tx.type}</td>
                <td className="text-ink-900 text-price px-5 py-3.5">৳{tx.amount}</td>
                <td className="text-charcoal px-5 py-3.5">{tx.method}</td>
                <td className="text-charcoal px-5 py-3.5">{tx.orderIds.length}</td>
                <td className="px-5 py-3.5">
                  <Badge className={STATUS_CHIP[tx.status] ?? "bg-soft-cloud text-mute"}>
                    {tx.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  {tx.status === "PENDING" && (
                    <div className="flex gap-2">
                      <ConfirmableForm
                        action={reconcileTransactionAction.bind(null, String(tx._id))}
                        title="Reconcile this transaction?"
                        description={`This marks the ledger entry RECONCILED and updates payment.status on ${tx.orderIds.length} linked order(s). This can't be undone from here.`}
                        confirmLabel="Reconcile"
                      >
                        <Button type="submit" variant="outline" size="icon-sm" title="Reconcile">
                          <CheckCircleIcon size={14} />
                        </Button>
                      </ConfirmableForm>
                      <ConfirmableForm
                        action={voidTransactionAction.bind(null, String(tx._id))}
                        title="Void this transaction?"
                        description="This permanently deletes the PENDING ledger entry. This can't be undone."
                        confirmLabel="Void"
                        confirmVariant="destructive"
                      >
                        <Button type="submit" variant="outline" size="icon-sm" title="Void">
                          <XCircleIcon size={14} />
                        </Button>
                      </ConfirmableForm>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/transactions"
        params={{ status: params.status }}
      />
    </div>
  );
}
