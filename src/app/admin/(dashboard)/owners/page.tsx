import { PlusIcon, PencilSimpleIcon, ProhibitIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getActiveOwners } from "@/lib/services/owner.service";
import { Button } from "@/components/ui/button";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { createOwnerAction, updateOwnerAction, deactivateOwnerAction } from "./actions";
import { EmptyTableRow } from "@/components/ui/empty-state";

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
        <h1 className="text-ink-900 text-heading-lg">Owners</h1>
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

      <div className="border-hairline overflow-x-auto rounded-none border bg-white">
        <table className="admin-data-table text-body-sm w-full min-w-[500px] text-left">
          <thead className="border-hairline bg-soft-cloud border-b">
            <tr>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Name</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Phone</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {owners.length === 0 && <EmptyTableRow colSpan={3} message="No owners yet." />}
            {owners.map((owner) => (
              <tr
                key={String(owner._id)}
                className="border-hairline-soft hover:bg-soft-cloud border-b transition-colors last:border-0"
              >
                <td className="text-ink-900 text-body-sm-strong px-5 py-3.5">{owner.name}</td>
                <td className="text-mute px-5 py-3.5">{owner.phone}</td>
                <td className="px-5 py-3.5">
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
