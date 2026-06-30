import Link from "next/link";
import { connectDB } from "@/lib/db";
import { getCustomers } from "@/lib/services/customer.service";
import { cn } from "@/lib/utils";

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
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-4 py-3 font-bold">Name</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Email</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Phone</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="text-ink-500 px-4 py-8 text-center">
                  No customers yet.
                </td>
              </tr>
            )}
            {items.map((customer) => (
              <tr key={String(customer._id)} className="border-ink-200 border-b last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${customer._id}`}
                    className="font-semibold text-green-700 hover:underline"
                  >
                    {customer.name}
                  </Link>
                </td>
                <td className="text-ink-700 px-4 py-3">{customer.email}</td>
                <td className="text-ink-700 px-4 py-3">{customer.phone}</td>
                <td className="text-ink-500 px-4 py-3">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/customers?page=${p}`}
              className={cn(
                "border-ink-900 border-2 px-3 py-1.5 text-xs font-bold",
                p === page ? "bg-ink-900 text-white" : "hover:bg-ink-100 bg-white",
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
