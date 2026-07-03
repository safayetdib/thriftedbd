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
        "group border-ink-900 flex size-5 items-center justify-center rounded-sm border bg-white transition-colors focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:outline-none data-checked:border-green-500 data-checked:bg-green-500 data-disabled:pointer-events-none data-disabled:opacity-50 data-indeterminate:border-green-500 data-indeterminate:bg-green-500",
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
          <MinusIcon className="text-ink-900 size-3" weight="bold" />
        ) : (
          <CheckIcon className="text-ink-900 size-3" weight="bold" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
