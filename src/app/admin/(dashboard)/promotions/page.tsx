import { PlusIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getAllPromotions } from "@/lib/services/promotion.service";
import { Button } from "@/components/ui/button";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { createPromotionAction, updatePromotionAction, deletePromotionAction } from "./actions";

const FIELDS: EntityField[] = [
  {
    name: "type",
    label: "Type",
    required: true,
    type: "select",
    options: ["top-bar", "modal", "section", "offer-card"],
  },
  { name: "pages", label: "Pages (comma-separated)", required: true },
  { name: "title", label: "Admin title", required: true },
  { name: "headline.en", label: "Headline (English)" },
  { name: "headline.bn", label: "Headline (Bangla)" },
  { name: "body.en", label: "Body (English)" },
  { name: "body.bn", label: "Body (Bangla)" },
  { name: "imageUrl", label: "Image URL" },
  { name: "imageKey", label: "Image key (R2)" },
  { name: "ctaText.en", label: "CTA text (English)" },
  { name: "ctaText.bn", label: "CTA text (Bangla)" },
  { name: "ctaLink", label: "CTA link" },
  { name: "backgroundColor", label: "Background color (hex)" },
  { name: "activeFrom", label: "Active from (ISO 8601)" },
  { name: "activeTo", label: "Active to (ISO 8601)" },
  { name: "order", label: "Display order", type: "number" },
];

export default async function AdminPromotionsPage() {
  await connectDB();
  const result = await getAllPromotions({ page: 1, limit: 100 });
  const promotions = result.items;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-2xl font-extrabold">Promotions</h1>
        <EntityFormDialog
          trigger={
            <Button variant="primary" size="sm">
              <PlusIcon size={16} /> New promotion
            </Button>
          }
          title="New promotion"
          fields={FIELDS}
          onSubmit={createPromotionAction}
        />
      </div>

      <div className="border-ink-900 overflow-x-auto border-2 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-4 py-3 font-bold">Title</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Type</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Pages</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Enabled</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Active from</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Active to</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 && (
              <tr>
                <td colSpan={7} className="text-ink-500 px-4 py-8 text-center">
                  No promotions yet. Create one to get started.
                </td>
              </tr>
            )}
            {promotions.map((promotion) => (
              <tr key={promotion._id.toString()} className="border-ink-900 border-t-2">
                <td className="px-4 py-3">{promotion.title}</td>
                <td className="px-4 py-3">
                  <span className="bg-ink-100 px-2 py-1 text-xs font-semibold">
                    {promotion.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{promotion.pages.join(", ")}</td>
                <td className="px-4 py-3">
                  <span className={promotion.enabled ? "font-bold text-green-700" : "text-ink-500"}>
                    {promotion.enabled ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {promotion.activeFrom ? new Date(promotion.activeFrom).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-xs">
                  {promotion.activeTo ? new Date(promotion.activeTo).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <EntityFormDialog
                      trigger={
                        <Button variant="secondary" size="sm">
                          <PencilSimpleIcon size={14} />
                        </Button>
                      }
                      title="Edit promotion"
                      fields={FIELDS}
                      initialValues={promotion as Record<string, unknown>}
                      onSubmit={(input) => updatePromotionAction(promotion._id.toString(), input)}
                    />
                    <ConfirmableForm
                      action={() => deletePromotionAction(promotion._id.toString())}
                      title="Delete promotion?"
                      description="This action cannot be undone."
                      confirmLabel="Delete"
                      confirmVariant="destructive"
                    >
                      <Button variant="secondary" size="sm" type="submit">
                        <TrashIcon size={14} />
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
