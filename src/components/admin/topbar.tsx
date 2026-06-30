import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { adminSignOutAction } from "@/app/admin/actions";

export function AdminTopbar({ email }: { email: string }) {
  return (
    <header className="border-ink-900 flex h-14 shrink-0 items-center justify-between border-b-2 bg-white px-6">
      <p className="text-ink-500 text-sm">
        Signed in as <span className="text-ink-900 font-semibold">{email}</span>
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
