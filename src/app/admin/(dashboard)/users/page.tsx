import { PlusIcon, KeyIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getUsers } from "@/lib/services/user.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { createUserAction, updateUserPasswordAction } from "./actions";

const CREATE_FIELDS: EntityField[] = [
  { name: "email", label: "Email", type: "email", required: true },
  { name: "password", label: "Password", type: "password", required: true },
];

const PASSWORD_FIELDS: EntityField[] = [
  { name: "password", label: "New password", type: "password", required: true },
];

export default async function AdminUsersPage() {
  await connectDB();
  const users = await getUsers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-2xl font-extrabold">Admin users</h1>
        <EntityFormDialog
          trigger={
            <Button variant="primary" size="sm">
              <PlusIcon size={16} /> New admin
            </Button>
          }
          title="New admin user"
          fields={CREATE_FIELDS}
          onSubmit={createUserAction}
        />
      </div>

      <div className="border-ink-900 overflow-x-auto border-2 bg-white">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="border-ink-900 bg-ink-100 border-b-2">
            <tr>
              <th className="text-ink-900 px-4 py-3 font-bold">Email</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Role</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Created</th>
              <th className="text-ink-900 px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={String(user._id)} className="border-ink-200 border-b last:border-0">
                <td className="text-ink-900 px-4 py-3 font-semibold">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="premium">{user.role}</Badge>
                </td>
                <td className="text-ink-500 px-4 py-3">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <EntityFormDialog
                    trigger={
                      <Button variant="outline" size="icon-sm">
                        <KeyIcon size={14} />
                      </Button>
                    }
                    title={`Reset password — ${user.email}`}
                    fields={PASSWORD_FIELDS}
                    onSubmit={updateUserPasswordAction.bind(null, String(user._id))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
