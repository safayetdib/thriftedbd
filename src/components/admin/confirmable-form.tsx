"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Wraps a <form> whose submit triggers a server action, inserting an
 * "are you sure?" step in between. Captures the clicked submit button's
 * name/value (forms here often have several differently-valued submit
 * buttons, e.g. Confirmed/Unreachable/On hold) so the confirmed action
 * carries the same FormData a native submit would have produced.
 */
export function ConfirmableForm({
  action,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  className,
  children,
}: {
  action: (formData: FormData) => Promise<unknown> | void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "destructive";
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<FormData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const formData = new FormData(e.currentTarget);
    if (submitter?.name) formData.set(submitter.name, submitter.value);
    setPending(formData);
  }

  async function handleConfirm() {
    if (!pending) return;
    setSubmitting(true);
    await action(pending);
    setSubmitting(false);
    setPending(null);
    router.refresh();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant={confirmVariant} onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Working…" : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
