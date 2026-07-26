import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { adminSignOutAction } from "@/app/admin/actions";

export function AdminTopbar({ email }: { email: string }) {
  return (
    <header className="border-hairline flex h-14 shrink-0 items-center justify-between border-b bg-white px-6">
      <p className="text-mute text-body-sm">
        Signed in as <span className="text-ink-900 text-body-sm-strong">{email}</span>
      </p>
      <form action={adminSignOutAction}>
        <Button type="submit" variant="ghost" size="sm">
          <SignOutIcon size={16} />
          Sign out
        </Button>
      </form>
    </header>
  );
}
