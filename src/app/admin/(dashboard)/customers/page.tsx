import Link from "next/link";
import { connectDB } from "@/lib/db";
import { getCustomers } from "@/lib/services/customer.service";
import { AdminPagination } from "@/components/admin/pagination";
import { EmptyTableRow } from "@/components/ui/empty-state";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  await connectDB();
  const { items, total, limit } = await getCustomers({ page, limit: 24 });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-heading-lg">Customers</h1>
        <p className="text-mute text-body-sm">{total} total</p>
      </div>

      <div className="border-hairline overflow-x-auto rounded-none border bg-white">
        <table className="admin-data-table text-body-sm w-full min-w-[640px] text-left">
          <thead className="border-hairline bg-soft-cloud border-b">
            <tr>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Name</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Email</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Phone</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Joined</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyTableRow colSpan={4} message="No customers yet." />}
            {items.map((customer) => (
              <tr
                key={String(customer._id)}
                className="border-hairline-soft hover:bg-soft-cloud border-b transition-colors last:border-0"
              >
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/customers/${customer._id}`}
                    className="text-ink-900 text-body-sm-strong hover:underline"
                  >
                    {customer.name}
                  </Link>
                </td>
                <td className="text-charcoal px-5 py-3.5">{customer.email}</td>
                <td className="text-charcoal px-5 py-3.5">{customer.phone}</td>
                <td className="text-mute px-5 py-3.5">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/customers"
        params={{}}
      />
    </div>
  );
}
