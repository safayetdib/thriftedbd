"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLoginAction } from "./actions";

export default function AdminLoginPage() {
  const [error, formAction, isPending] = useActionState(adminLoginAction, undefined);

  return (
    <main className="bg-soft-cloud flex min-h-screen items-center justify-center px-4">
      <div className="border-hairline w-full max-w-sm rounded-none border bg-white p-8">
        <p className="text-eyebrow text-caption-sm text-mute">thriftedBD</p>
        <h1 className="text-ink-900 text-heading-lg mt-1">Admin sign in</h1>

        <form action={formAction} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="border-sale-500 bg-sale-50 text-sale-700 text-body-sm rounded-none border px-3 py-2"
            >
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="mt-2 w-full" loading={isPending}>
            Sign in
          </Button>
        </form>
      </div>
    </main>
  );
}
