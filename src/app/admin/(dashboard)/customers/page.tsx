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
        <h1 className="text-ink-900 text-2xl font-extrabold">Customers</h1>
        <p className="text-ink-500 text-sm">{total} total</p>
      </div>

      <div className="border-ink-900 overflow-x-auto border-2 bg-white">
        <table className="admin-data-table w-full min-w-[640px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Name</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Email</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Phone</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyTableRow colSpan={4} message="No customers yet." />}
            {items.map((customer) => (
              <tr
                key={String(customer._id)}
                className="border-ink-200 hover:bg-ink-50 border-b transition-colors last:border-0"
              >
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/customers/${customer._id}`}
                    className="font-semibold text-green-700 hover:underline"
                  >
                    {customer.name}
                  </Link>
                </td>
                <td className="text-ink-700 px-5 py-3.5">{customer.email}</td>
                <td className="text-ink-700 px-5 py-3.5">{customer.phone}</td>
                <td className="text-ink-500 px-5 py-3.5">
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
