import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { EntityFormDialog, type EntityField } from "@/components/admin/entity-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getUsers } from "@/lib/services/user.service";
import { KeyIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { createUserAction, deleteUserAction, updateUserPasswordAction } from "./actions";

const CREATE_FIELDS: EntityField[] = [
  { name: "email", label: "Email", type: "email", required: true },
  { name: "password", label: "Password", type: "password", required: true },
  { name: "role", label: "Role", type: "select", options: ["admin", "superadmin"], required: true },
];

const PASSWORD_FIELDS: EntityField[] = [
  { name: "password", label: "New password", type: "password", required: true },
];

export default async function AdminUsersPage() {
  const session = await auth();

  // Admin-user management is superadmin-only. Regular admins get a notice
  // instead of the list; the server actions enforce this independently too.
  if (session?.user?.role !== "superadmin") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-ink-900 text-heading-lg">Admin users</h1>
        <div className="border-hairline text-mute rounded-none border bg-white px-6 py-10 text-center">
          Managing admin users is restricted to superadmins.
        </div>
      </div>
    );
  }

  await connectDB();
  const users = await getUsers();
  const superadminCount = users.filter((u) => u.role === "superadmin").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-ink-900 text-heading-lg">Admin users</h1>
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

      <div className="border-hairline overflow-x-auto rounded-none border bg-white">
        <table className="admin-data-table text-body-sm w-full min-w-[500px] text-left">
          <thead className="border-hairline bg-soft-cloud border-b">
            <tr>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Email</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Role</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Created</th>
              <th className="text-ink-900 text-caption-md px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const id = String(user._id);
              const isSelf = session.user.id === id;
              const isLastSuperadmin = user.role === "superadmin" && superadminCount <= 1;
              const canDelete = !isSelf && !isLastSuperadmin;
              return (
                <tr
                  key={id}
                  className="border-hairline-soft hover:bg-soft-cloud border-b transition-colors last:border-0"
                >
                  <td className="text-ink-900 text-body-sm-strong px-5 py-3.5">
                    {user.email}
                    {isSelf && <span className="text-mute text-caption-sm"> (you)</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className="bg-soft-cloud text-charcoal">{user.role}</Badge>
                  </td>
                  <td className="text-mute px-5 py-3.5">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <EntityFormDialog
                        trigger={
                          <Button variant="outline" size="icon-sm">
                            <KeyIcon size={14} />
                          </Button>
                        }
                        title={`Reset password - ${user.email}`}
                        fields={PASSWORD_FIELDS}
                        onSubmit={updateUserPasswordAction.bind(null, id)}
                      />
                      {canDelete && (
                        <ConfirmableForm
                          action={deleteUserAction.bind(null, id)}
                          title={`Delete "${user.email}"?`}
                          description="This permanently removes the admin user. This cannot be undone."
                          confirmLabel="Delete"
                          confirmVariant="destructive"
                        >
                          <Button type="submit" variant="outline" size="icon-sm">
                            <TrashIcon size={14} />
                          </Button>
                        </ConfirmableForm>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
