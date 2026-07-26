import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "text-ink-900 placeholder:text-mute aria-invalid:border-sale-500 bg-ink-50 focus-visible:border-ink-900 w-full min-w-0 resize-y rounded-sm border border-transparent px-4 py-3 text-base transition-colors outline-none focus-visible:bg-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
