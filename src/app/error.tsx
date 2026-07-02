"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-eyebrow text-ink-500">Something went wrong</p>
      <h1 className="text-ink-900 mt-2 text-3xl font-extrabold">Unexpected error</h1>
      <p className="text-ink-600 mt-3 max-w-sm text-sm">
        We hit an unexpected error. Please try again.
      </p>
      <div className="mt-8">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
