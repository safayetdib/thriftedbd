"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

function Checkbox({ className, indeterminate, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group border-hairline focus-visible:ring-ink-900 data-checked:border-ink-900 data-checked:bg-ink-900 data-indeterminate:border-ink-900 data-indeterminate:bg-ink-900 flex size-5 items-center justify-center rounded-[3px] border bg-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      indeterminate={indeterminate}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          "flex items-center justify-center transition-transform duration-150 data-checked:scale-100 data-unchecked:scale-0",
        )}
      >
        {indeterminate ? (
          <MinusIcon className="size-3 text-white" weight="bold" />
        ) : (
          <CheckIcon className="size-3 text-white" weight="bold" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
