import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { AdminPagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyTableRow } from "@/components/ui/empty-state";
import { connectDB } from "@/lib/db";
import { getAdminProducts } from "@/lib/services/product.service";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { deleteProductAction } from "./actions";

const STATUS_FILTERS = ["All", "DRAFT", "ACTIVE", "SOLD", "ARCHIVED"] as const;

/** See the note on STATUS_CHIP in the orders list - same semantic ramp. */
const STATUS_CHIP: Record<string, string> = {
  DRAFT: "bg-soft-cloud text-mute",
  ACTIVE: "bg-soft-cloud text-success",
  SOLD: "bg-soft-cloud text-ink-900",
  ARCHIVED: "bg-soft-cloud text-mute",
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
        <h1 className="text-ink-900 text-heading-lg">Products</h1>
        <Link href="/admin/products/new" prefetch={false}>
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
              <th className="text-ink-900 text-caption-md px-5 py-3.5">SKU</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Title</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Price</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Status</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Created</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyTableRow colSpan={6} message="No products found." />}
            {items.map((product) => (
              <tr
                key={String(product._id)}
                className="border-hairline-soft hover:bg-soft-cloud border-b transition-colors last:border-0"
              >
                <td className="text-mute px-5 py-3.5">{product.sku}</td>
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="text-ink-900 text-body-sm-strong hover:underline"
                    prefetch={false}
                  >
                    {product.title.en}
                  </Link>
                </td>
                <td className="text-ink-900 text-body-sm-strong px-5 py-3.5">৳{product.price}</td>
                <td className="px-5 py-3.5">
                  <Badge className={STATUS_CHIP[product.status] ?? "bg-soft-cloud text-mute"}>
                    {product.status}
                  </Badge>
                </td>
                <td className="text-mute px-5 py-3.5">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5">
                  {product.status === "ARCHIVED" && (
                    <ConfirmableForm
                      action={deleteProductAction.bind(null, String(product._id))}
                      title={`Delete "${product.title.en}" permanently?`}
                      description="This removes the product record and deletes its images from R2 storage. This cannot be undone."
                      confirmLabel="Delete permanently"
                      confirmVariant="destructive"
                    >
                      <Button type="submit" variant="outline" size="icon-sm">
                        <TrashIcon size={14} />
                      </Button>
                    </ConfirmableForm>
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
        basePath="/admin/products"
        params={{ status: params.status }}
      />
    </div>
  );
}
