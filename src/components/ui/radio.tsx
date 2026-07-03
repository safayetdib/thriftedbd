"use client";

import * as React from "react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

import { cn } from "@/lib/utils";

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-item"
      className={cn(
        "group border-ink-900 flex size-5 items-center justify-center rounded-full border bg-white transition-colors focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:outline-none data-checked:border-green-500 data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="flex items-center justify-center transition-transform duration-150 data-checked:scale-100 data-unchecked:scale-0">
        <span className="size-2.5 rounded-full bg-green-500" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
