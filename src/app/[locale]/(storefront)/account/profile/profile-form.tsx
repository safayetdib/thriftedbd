"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("profile");
  const [state, formAction, isPending] = useActionState(updateProfileAction, { error: "" });
  const error = state?.error;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-xl text-ink-900">{t("title")}</h1>
        <p className="text-body-sm text-mute">{t("blurb")}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        <div className="border-hairline flex flex-col gap-4 rounded-none border bg-white p-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={customer.email}
              disabled
              className="bg-soft-cloud cursor-not-allowed"
            />
            <p className="text-caption-sm text-mute">{t("emailLocked")}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("fullName")}</Label>
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
            <Label htmlFor="phone">{t("phone")}</Label>
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
            <p
              role="alert"
              className="border-sale-500 bg-sale-50 text-sale-700 text-caption-md rounded-none border px-3 py-2"
            >
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" loading={isPending}>
            {t("saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}
