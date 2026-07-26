"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerLoginAction } from "./actions";

export default function CustomerLoginPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [error, formAction, isPending] = useActionState(customerLoginAction, undefined);

  return (
    <main className="bg-soft-cloud flex min-h-screen items-center justify-center px-4">
      <div className="border-hairline w-full max-w-sm rounded-none border bg-white p-8">
        <p className="text-eyebrow text-caption-sm text-ink-900">thriftedBD</p>
        <h1 className="text-heading-xl text-ink-900 mt-1">{t("signIn")}</h1>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
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

          <Button type="submit" variant="primary" className="mt-2 w-full" loading={isPending}>
            {t("signIn")}
          </Button>
        </form>

        <div className="text-body-sm text-mute mt-6 text-center">
          {t("noAccount")}{" "}
          <Link
            href="/signup"
            className="text-caption-md text-ink-900 underline hover:no-underline"
          >
            {t("createOne")}
          </Link>
        </div>
      </div>
    </main>
  );
}
