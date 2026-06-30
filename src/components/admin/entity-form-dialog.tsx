"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EntityField = {
  /** Dot path, e.g. "name.en" — nested objects are built from these on submit. */
  name: string;
  label: string;
  type?: "text" | "number" | "password" | "email" | "select" | "csv";
  /** Required when type is "select". */
  options?: string[];
  required?: boolean;
};

function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let cursor = target;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof cursor[key] !== "object" || cursor[key] === null) cursor[key] = {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1]] = value;
}

function getPath(source: Record<string, unknown>, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], source);
  return value === undefined || value === null ? "" : String(value);
}

export function EntityFormDialog({
  trigger,
  title,
  fields,
  initialValues,
  onSubmit,
}: {
  trigger: React.ReactElement;
  title: string;
  fields: EntityField[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const field of fields) {
      init[field.name] = initialValues ? getPath(initialValues, field.name) : "";
    }
    return init;
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirming(true);
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = values[field.name];
      if (raw === "" && !field.required) continue;
      const value =
        field.type === "number"
          ? Number(raw)
          : field.type === "csv"
            ? raw
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
            : raw;
      setPath(payload, field.name, value);
    }

    const result = await onSubmit(payload);
    setSubmitting(false);
    if (result?.error) {
      setConfirming(false);
      setError(result.error);
      return;
    }
    setConfirming(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirming(false);
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {confirming ? (
          <>
            <DialogHeader>
              <DialogTitle>Save these changes?</DialogTitle>
            </DialogHeader>
            <dl className="flex flex-col gap-2 text-sm">
              {fields.map((field) => (
                <div key={field.name} className="flex justify-between gap-3">
                  <dt className="text-ink-500">{field.label}</dt>
                  <dd className="text-ink-900 text-right font-semibold">
                    {field.type === "password"
                      ? "•".repeat(values[field.name].length) || "—"
                      : values[field.name] || "—"}
                  </dd>
                </div>
              ))}
            </dl>
            {error && (
              <p className="border-sale-500 bg-sale-50 text-sale-700 border-2 px-3 py-2 text-sm font-medium">
                {error}
              </p>
            )}
            <div className="mt-1 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirming(false)}
                disabled={submitting}
              >
                Back
              </Button>
              <Button type="button" variant="primary" onClick={handleConfirm} disabled={submitting}>
                {submitting ? "Saving…" : "Confirm & save"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleReview} className="flex flex-col gap-3">
              {fields.map((field) => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === "select" ? (
                    <select
                      id={field.name}
                      required={field.required}
                      value={values[field.name]}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                      className="border-ink-900 h-11 border-2 bg-white px-3 text-sm"
                    >
                      <option value="">— Select —</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type === "csv" ? "text" : (field.type ?? "text")}
                      required={field.required}
                      value={values[field.name]}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}
              {error && (
                <p className="border-sale-500 bg-sale-50 text-sale-700 border-2 px-3 py-2 text-sm font-medium">
                  {error}
                </p>
              )}
              <Button type="submit" variant="primary" className="mt-1">
                Review &amp; save
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
