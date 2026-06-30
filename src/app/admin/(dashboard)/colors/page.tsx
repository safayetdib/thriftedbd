import { PlusIcon, PencilSimpleIcon, ProhibitIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getActiveColors } from "@/lib/services/color.service";
import { Button } from "@/components/ui/button";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { createColorAction, updateColorAction, deactivateColorAction } from "./actions";

const FIELDS: EntityField[] = [
  { name: "name.en", label: "Name (English)", required: true },
  { name: "name.bn", label: "Name (Bangla, optional)" },
  { name: "hex", label: "Hex (e.g. #1A2B3C)" },
];

export default async function AdminColorsPage() {
  await connectDB();
  const colors = await getActiveColors();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-2xl font-extrabold">Colors</h1>
        <EntityFormDialog
          trigger={
            <Button variant="primary" size="sm">
              <PlusIcon size={16} /> New color
            </Button>
          }
          title="New color"
          fields={FIELDS}
          onSubmit={createColorAction}
        />
      </div>

      <div className="border-ink-900 overflow-x-auto border-2 bg-white">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-4 py-3 font-bold">Swatch</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Name</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Hex</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {colors.length === 0 && (
              <tr>
                <td colSpan={4} className="text-ink-500 px-4 py-8 text-center">
                  No colors yet.
                </td>
              </tr>
            )}
            {colors.map((color) => (
              <tr key={String(color._id)} className="border-ink-200 border-b last:border-0">
                <td className="px-4 py-3">
                  <span
                    className="border-ink-900 block size-6 border-2"
                    style={{ backgroundColor: color.hex ?? "#fff" }}
                  />
                </td>
                <td className="text-ink-900 px-4 py-3 font-semibold">{color.name.en}</td>
                <td className="text-ink-500 px-4 py-3">{color.hex ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <EntityFormDialog
                      trigger={
                        <Button variant="outline" size="icon-sm">
                          <PencilSimpleIcon size={14} />
                        </Button>
                      }
                      title={`Edit ${color.name.en}`}
                      fields={FIELDS}
                      initialValues={{
                        name: { en: color.name.en, bn: color.name.bn },
                        hex: color.hex,
                      }}
                      onSubmit={updateColorAction.bind(null, String(color._id))}
                    />
                    <ConfirmableForm
                      action={deactivateColorAction.bind(null, String(color._id))}
                      title={`Deactivate "${color.name.en}"?`}
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
