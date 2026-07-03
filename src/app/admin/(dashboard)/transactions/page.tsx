import Link from "next/link";
import { PlusIcon, CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getTransactions } from "@/lib/services/transaction.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { cn } from "@/lib/utils";
import { AdminPagination } from "@/components/admin/pagination";
import {
  createTransactionAction,
  reconcileTransactionAction,
  voidTransactionAction,
} from "./actions";
import { EmptyTableRow } from "@/components/ui/empty-state";

const STATUS_FILTERS = ["All", "PENDING", "RECEIVED", "RECONCILED"] as const;

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
        <h1 className="text-ink-900 text-2xl font-extrabold">Transactions</h1>
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
        <table className="admin-data-table w-full min-w-[760px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Type</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Amount</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Method</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Orders</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Status</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyTableRow colSpan={6} message="No transactions found." />}
            {items.map((tx) => (
              <tr
                key={String(tx._id)}
                className="border-ink-200 hover:bg-ink-50 border-b transition-colors last:border-0"
              >
                <td className="text-ink-900 px-5 py-3.5 font-semibold">{tx.type}</td>
                <td className="text-ink-900 px-5 py-3.5">৳{tx.amount}</td>
                <td className="text-ink-700 px-5 py-3.5">{tx.method}</td>
                <td className="text-ink-700 px-5 py-3.5">{tx.orderIds.length}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={tx.status === "RECONCILED" ? "new" : "sold"}>{tx.status}</Badge>
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
