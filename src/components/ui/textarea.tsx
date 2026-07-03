import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-ink-900 text-ink-900 placeholder:text-ink-400 aria-invalid:border-sale-500 aria-invalid:ring-sale-500/20 w-full min-w-0 resize-y rounded-md border bg-white px-4 py-3 text-base transition-colors outline-none focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
