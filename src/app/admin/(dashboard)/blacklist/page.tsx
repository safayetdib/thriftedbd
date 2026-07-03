import { PlusIcon, PencilSimpleIcon, ProhibitIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getBlacklist } from "@/lib/services/blacklist.service";
import { Button } from "@/components/ui/button";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { createBlacklistAction, updateBlacklistAction, deactivateBlacklistAction } from "./actions";
import { EmptyTableRow } from "@/components/ui/empty-state";

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
        <h1 className="text-ink-900 text-2xl font-extrabold">Blacklist</h1>
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

      <div className="border-ink-900 overflow-x-auto border-2 bg-white">
        <table className="admin-data-table w-full min-w-[600px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Phone</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Name</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Reason</th>
              <th className="text-ink-900 px-5 py-3.5 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <EmptyTableRow colSpan={4} message="No blacklisted numbers." />
            )}
            {entries.map((entry) => (
              <tr
                key={String(entry._id)}
                className="border-ink-200 hover:bg-ink-50 border-b transition-colors last:border-0"
              >
                <td className="text-ink-900 px-5 py-3.5 font-semibold">{entry.phone}</td>
                <td className="text-ink-700 px-5 py-3.5">{entry.name ?? "—"}</td>
                <td className="text-ink-700 px-5 py-3.5">{entry.reason}</td>
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
