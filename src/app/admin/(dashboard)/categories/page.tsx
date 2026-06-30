import { PlusIcon, PencilSimpleIcon, ProhibitIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getActiveCategories } from "@/lib/services/category.service";
import { Button } from "@/components/ui/button";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { createCategoryAction, updateCategoryAction, deactivateCategoryAction } from "./actions";

const FIELDS: EntityField[] = [
  { name: "name.en", label: "Name (English)", required: true },
  { name: "name.bn", label: "Name (Bangla, optional)" },
  { name: "slug", label: "Slug", required: true },
  { name: "order", label: "Sort order", type: "number" },
];

export default async function AdminCategoriesPage() {
  await connectDB();
  const categories = await getActiveCategories();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-2xl font-extrabold">Categories</h1>
        <EntityFormDialog
          trigger={
            <Button variant="primary" size="sm">
              <PlusIcon size={16} /> New category
            </Button>
          }
          title="New category"
          fields={FIELDS}
          onSubmit={createCategoryAction}
        />
      </div>

      <div className="border-ink-900 overflow-x-auto border-2 bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-4 py-3 font-bold">Name</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Slug</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Level</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Order</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="text-ink-500 px-4 py-8 text-center">
                  No categories yet.
                </td>
              </tr>
            )}
            {categories.map((category) => (
              <tr key={String(category._id)} className="border-ink-200 border-b last:border-0">
                <td className="text-ink-900 px-4 py-3 font-semibold">{category.name.en}</td>
                <td className="text-ink-500 px-4 py-3">{category.slug}</td>
                <td className="text-ink-700 px-4 py-3">{category.level}</td>
                <td className="text-ink-700 px-4 py-3">{category.order}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <EntityFormDialog
                      trigger={
                        <Button variant="outline" size="icon-sm">
                          <PencilSimpleIcon size={14} />
                        </Button>
                      }
                      title={`Edit ${category.name.en}`}
                      fields={FIELDS}
                      initialValues={{
                        name: { en: category.name.en, bn: category.name.bn },
                        slug: category.slug,
                        order: category.order,
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
