import { PlusIcon, PencilSimpleIcon, ProhibitIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getActiveCategories } from "@/lib/services/category.service";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { createCategoryAction, updateCategoryAction, deactivateCategoryAction } from "./actions";
import { EmptyTableRow } from "@/components/ui/empty-state";

export default async function AdminCategoriesPage() {
  await connectDB();
  const categories = await getActiveCategories();

  // Top-level categories are the only valid parents for a subcategory.
  const parentOptions = categories
    .filter((c) => c.level === 0)
    .map((c) => ({ id: String(c._id), name: c.name.en }));

  // Order rows as a tree: each department immediately followed by its children,
  // then any leftovers (orphans / deeper levels) so nothing is hidden.
  const grouped = categories
    .filter((c) => c.level === 0)
    .flatMap((dept) => [
      dept,
      ...categories.filter((c) => c.level > 0 && String(c.parentId) === String(dept._id)),
    ]);
  const rows = [...grouped, ...categories.filter((c) => !grouped.includes(c))];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-heading-lg">Categories</h1>
        <CategoryFormDialog
          trigger={
            <Button variant="primary" size="sm">
              <PlusIcon size={16} /> New category
            </Button>
          }
          title="New category"
          onSubmit={createCategoryAction}
          parentOptions={parentOptions}
        />
      </div>

      <div className="border-hairline overflow-x-auto rounded-none border bg-white">
        <table className="admin-data-table text-body-sm w-full min-w-[600px] text-left">
          <thead className="border-hairline bg-soft-cloud border-b">
            <tr>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Name</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Slug</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Level</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Order</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <EmptyTableRow colSpan={5} message="No categories yet." />}
            {rows.map((category) => (
              <tr
                key={String(category._id)}
                className="border-hairline-soft hover:bg-soft-cloud border-b transition-colors last:border-0"
              >
                <td className="text-ink-900 text-body-sm-strong px-5 py-3.5">
                  {category.level > 0 && <span className="text-stone">↳ </span>}
                  {category.name.en}
                </td>
                <td className="text-mute px-5 py-3.5">{category.slug}</td>
                <td className="text-charcoal px-5 py-3.5">{category.level}</td>
                <td className="text-charcoal px-5 py-3.5">{category.order}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <CategoryFormDialog
                      trigger={
                        <Button variant="outline" size="icon-sm">
                          <PencilSimpleIcon size={14} />
                        </Button>
                      }
                      title={`Edit ${category.name.en}`}
                      initialValues={{
                        name: { en: category.name.en },
                        slug: category.slug,
                        order: category.order,
                        coverImage: category.coverImage,
                      }}
                      onSubmit={updateCategoryAction.bind(null, String(category._id))}
                    />
                    <ConfirmableForm
                      action={deactivateCategoryAction.bind(null, String(category._id))}
                      title={`Deactivate "${category.name.en}"?`}
                      description="It will no longer appear in the storefront or admin lists. You can't undo this from here."
                      confirmLabel="Deactivate"
                      confirmVariant="destructive"
                    >
                      <Button type="submit" variant="outline" size="icon-sm">
                        <ProhibitIcon size={14} />
                      </Button>
                    </ConfirmableForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
