import { PlusIcon, PencilSimpleIcon, ProhibitIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getBlacklist } from "@/lib/services/blacklist.service";
import { Button } from "@/components/ui/button";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { createBlacklistAction, updateBlacklistAction, deactivateBlacklistAction } from "./actions";

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
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-4 py-3 font-bold">Phone</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Name</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Reason</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="text-ink-500 px-4 py-8 text-center">
                  No blacklisted numbers.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr key={String(entry._id)} className="border-ink-200 border-b last:border-0">
                <td className="text-ink-900 px-4 py-3 font-semibold">{entry.phone}</td>
                <td className="text-ink-700 px-4 py-3">{entry.name ?? "—"}</td>
                <td className="text-ink-700 px-4 py-3">{entry.reason}</td>
                <td className="px-4 py-3">
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
