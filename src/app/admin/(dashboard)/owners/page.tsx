import { PlusIcon, PencilSimpleIcon, ProhibitIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getActiveOwners } from "@/lib/services/owner.service";
import { Button } from "@/components/ui/button";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { createOwnerAction, updateOwnerAction, deactivateOwnerAction } from "./actions";

const FIELDS: EntityField[] = [
  { name: "name", label: "Name", required: true },
  { name: "phone", label: "Phone", required: true },
];

export default async function AdminOwnersPage() {
  await connectDB();
  const owners = await getActiveOwners();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-2xl font-extrabold">Owners</h1>
        <EntityFormDialog
          trigger={
            <Button variant="primary" size="sm">
              <PlusIcon size={16} /> New owner
            </Button>
          }
          title="New owner"
          fields={FIELDS}
          onSubmit={createOwnerAction}
        />
      </div>

      <div className="border-ink-900 overflow-x-auto border-2 bg-white">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-4 py-3 font-bold">Name</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Phone</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {owners.length === 0 && (
              <tr>
                <td colSpan={3} className="text-ink-500 px-4 py-8 text-center">
                  No owners yet.
                </td>
              </tr>
            )}
            {owners.map((owner) => (
              <tr key={String(owner._id)} className="border-ink-200 border-b last:border-0">
                <td className="text-ink-900 px-4 py-3 font-semibold">{owner.name}</td>
                <td className="text-ink-500 px-4 py-3">{owner.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <EntityFormDialog
                      trigger={
                        <Button variant="outline" size="icon-sm">
                          <PencilSimpleIcon size={14} />
                        </Button>
                      }
                      title={`Edit ${owner.name}`}
                      fields={FIELDS}
                      initialValues={{ name: owner.name, phone: owner.phone }}
                      onSubmit={updateOwnerAction.bind(null, String(owner._id))}
                    />
                    <ConfirmableForm
                      action={deactivateOwnerAction.bind(null, String(owner._id))}
                      title={`Deactivate "${owner.name}"?`}
                      description="It will no longer be selectable for new products. You can't undo this from here."
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
