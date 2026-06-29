import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "border-ink-900 text-ink-900 file:text-ink-900 placeholder:text-ink-400 aria-invalid:border-sale-500 aria-invalid:ring-sale-500/20 h-11 w-full min-w-0 rounded-sm border-2 bg-white px-3 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
