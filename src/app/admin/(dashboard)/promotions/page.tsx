import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { Button } from "@/components/ui/button";
import { EmptyTableRow } from "@/components/ui/empty-state";
import { connectDB } from "@/lib/db";
import { getAllPromotions } from "@/lib/services/promotion.service";
import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { createPromotionAction, deletePromotionAction, updatePromotionAction } from "./actions";

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
  { name: "body.en", label: "Body (English)" },
  { name: "imageUrl", label: "Image URL" },
  { name: "imageKey", label: "Image key (R2)" },
  { name: "ctaText.en", label: "CTA text (English)" },
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
        <h1 className="text-ink-900 text-heading-lg">Promotions</h1>
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

      <div className="border-hairline overflow-x-auto rounded-none border bg-white">
        <table className="admin-data-table text-body-sm w-full min-w-[800px] text-left">
          <thead className="border-hairline bg-soft-cloud border-b">
            <tr>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Title</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Type</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Pages</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Enabled</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Active from</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Active to</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 && <EmptyTableRow colSpan={7} message="No promotions yet." />}
            {promotions.map((promotion) => (
              <tr
                key={promotion._id.toString()}
                className="border-hairline-soft hover:bg-soft-cloud border-b transition-colors last:border-0"
              >
                <td className="px-5 py-3.5">{promotion.title}</td>
                <td className="px-5 py-3.5">
                  <span className="bg-soft-cloud text-charcoal text-caption-sm rounded-pill px-2.5 py-1">
                    {promotion.type}
                  </span>
                </td>
                <td className="text-charcoal text-caption-sm px-5 py-3.5">
                  {promotion.pages.join(", ")}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={
                      promotion.enabled
                        ? "text-success text-body-sm-strong"
                        : "text-mute text-body-sm"
                    }
                  >
                    {promotion.enabled ? "Yes" : "No"}
                  </span>
                </td>
                <td className="text-charcoal text-caption-sm px-5 py-3.5">
                  {promotion.activeFrom ? new Date(promotion.activeFrom).toLocaleDateString() : "-"}
                </td>
                <td className="text-charcoal text-caption-sm px-5 py-3.5">
                  {promotion.activeTo ? new Date(promotion.activeTo).toLocaleDateString() : "-"}
                </td>
                <td className="px-5 py-3.5">
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
