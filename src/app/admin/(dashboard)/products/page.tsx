import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getAdminProducts } from "@/lib/services/product.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-4 py-3 font-bold">SKU</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Title</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Price</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Status</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-ink-500 px-4 py-8 text-center">
                  No products found.
                </td>
              </tr>
            )}
            {items.map((product) => (
              <tr key={String(product._id)} className="border-ink-200 border-b last:border-0">
                <td className="text-ink-500 px-4 py-3">{product.sku}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="font-semibold text-green-700 hover:underline"
                  >
                    {product.title.en}
                  </Link>
                </td>
                <td className="text-ink-900 px-4 py-3 font-semibold">৳{product.price}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE_VARIANT[product.status] ?? "sold"}>
                    {product.status}
                  </Badge>
                </td>
                <td className="text-ink-500 px-4 py-3">
                  {new Date(product.createdAt).toLocaleDateString()}
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
              href={`/admin/products?${params.status ? `status=${params.status}&` : ""}page=${p}`}
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
