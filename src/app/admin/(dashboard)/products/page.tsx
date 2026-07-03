import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getAdminProducts } from "@/lib/services/product.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminPagination } from "@/components/admin/pagination";
import { EmptyTableRow } from "@/components/ui/empty-state";

const STATUS_FILTERS = ["All", "DRAFT", "ACTIVE", "SOLD", "ARCHIVED"] as const;

const STATUS_BADGE_VARIANT: Record<string, "new" | "sale" | "sold" | "premium"> = {
  DRAFT: "sold",
  ACTIVE: "new",
  SOLD: "premium",
  ARCHIVED: "sale",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status && params.status !== "All" ? params.status : undefined;
  const page = Number(params.page) || 1;

  await connectDB();
  const { items, total, limit } = await getAdminProducts({ status, page, limit: 24 });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-2xl font-extrabold">Products</h1>
        <Link href="/admin/products/new">
          <Button variant="primary" size="sm">
            <PlusIcon size={16} /> New product
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const isActive = filter === (params.status ?? "All");
          return (
            <Link
              key={filter}
              href={filter === "All" ? "/admin/products" : `/admin/products?status=${filter}`}
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
              <th className="text-ink-900 px-5 py-3.5 font-bold">SKU</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Title</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Price</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Status</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyTableRow colSpan={5} message="No products found." />}
            {items.map((product) => (
              <tr
                key={String(product._id)}
                className="border-ink-200 hover:bg-ink-50 border-b transition-colors last:border-0"
              >
                <td className="text-ink-500 px-5 py-3.5">{product.sku}</td>
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="font-semibold text-green-700 hover:underline"
                  >
                    {product.title.en}
                  </Link>
                </td>
                <td className="text-ink-900 px-5 py-3.5 font-semibold">৳{product.price}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={STATUS_BADGE_VARIANT[product.status] ?? "sold"}>
                    {product.status}
                  </Badge>
                </td>
                <td className="text-ink-500 px-5 py-3.5">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/products"
        params={{ status: params.status }}
      />
    </div>
  );
}
