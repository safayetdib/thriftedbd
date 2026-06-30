"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "./actions";

interface Customer {
  email: string;
  name: string;
  phone: string;
}

export function ProfileForm({ customer }: { customer: Customer }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, { error: "" });
  const error = state?.error;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink-900 text-2xl font-extrabold">Profile</h1>
        <p className="text-ink-600 text-sm">Update your account information</p>
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        <div className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={customer.email}
              disabled
              className="bg-ink-50 cursor-not-allowed"
            />
            <p className="text-ink-500 text-xs">Email cannot be changed</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={customer.name}
              required
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={customer.phone}
              required
              disabled={isPending}
            />
          </div>

          {error && (
            <p className="border-sale-500 bg-sale-50 text-sale-700 border-2 px-3 py-2 text-sm font-medium">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
