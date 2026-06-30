"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLoginAction } from "./actions";

export default function AdminLoginPage() {
  const [error, formAction, isPending] = useActionState(adminLoginAction, undefined);

  return (
    <main className="bg-ink-50 flex min-h-screen items-center justify-center px-4">
      <div className="border-ink-900 shadow-brutal-md w-full max-w-sm border-2 bg-white p-8">
        <p className="text-eyebrow text-green-700">thriftedBD</p>
        <h1 className="text-ink-900 mt-1 text-2xl font-extrabold">Admin sign in</h1>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
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
            <p className="border-sale-500 bg-sale-50 text-sale-700 border-2 px-3 py-2 text-sm font-medium">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="mt-2 w-full" disabled={isPending}>
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
