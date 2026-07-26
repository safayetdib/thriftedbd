import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { Button } from "@/components/ui/button";
import { EmptyTableRow } from "@/components/ui/empty-state";
import { connectDB } from "@/lib/db";
import { getBlacklist } from "@/lib/services/blacklist.service";
import { PencilSimpleIcon, PlusIcon, ProhibitIcon } from "@phosphor-icons/react/dist/ssr";
import { createBlacklistAction, deactivateBlacklistAction, updateBlacklistAction } from "./actions";

const CREATE_FIELDS: EntityField[] = [
  { name: "phone", label: "Phone", required: true },
  { name: "name", label: "Name (optional)" },
  { name: "reason", label: "Reason", required: true },
];

const EDIT_FIELDS: EntityField[] = [{ name: "reason", label: "Reason", required: true }];

export default async function AdminBlacklistPage() {
  await connectDB();
  const entries = await getBlacklist({ isActive: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-heading-lg">Blacklist</h1>
        <EntityFormDialog
          trigger={
            <Button variant="primary" size="sm">
              <PlusIcon size={16} /> New entry
            </Button>
          }
          title="Blacklist a phone number"
          fields={CREATE_FIELDS}
          onSubmit={createBlacklistAction}
        />
      </div>

      <div className="border-hairline overflow-x-auto rounded-none border bg-white">
        <table className="admin-data-table text-body-sm w-full min-w-[600px] text-left">
          <thead className="border-hairline bg-soft-cloud border-b">
            <tr>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Phone</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Name</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Reason</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <EmptyTableRow colSpan={4} message="No blacklisted numbers." />
            )}
            {entries.map((entry) => (
              <tr
                key={String(entry._id)}
                className="border-hairline-soft hover:bg-soft-cloud border-b transition-colors last:border-0"
              >
                <td className="text-ink-900 text-body-sm-strong px-5 py-3.5">{entry.phone}</td>
                <td className="text-charcoal px-5 py-3.5">{entry.name ?? "-"}</td>
                <td className="text-charcoal px-5 py-3.5">{entry.reason}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <EntityFormDialog
                      trigger={
                        <Button variant="outline" size="icon-sm">
                          <PencilSimpleIcon size={14} />
                        </Button>
                      }
                      title={`Edit ${entry.phone}`}
                      fields={EDIT_FIELDS}
                      initialValues={{ reason: entry.reason }}
                      onSubmit={updateBlacklistAction.bind(null, String(entry._id))}
                    />
                    <ConfirmableForm
                      action={deactivateBlacklistAction.bind(null, String(entry._id))}
                      title={`Un-blacklist ${entry.phone}?`}
                      description="This phone number will be able to order again without the blacklist risk flag."
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
