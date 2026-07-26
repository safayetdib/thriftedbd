"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  // data-slot omitted — see DialogTrigger (avoids a base-ui SSR/client hydration mismatch).
  return <PopoverPrimitive.Trigger {...props} />;
}

function PopoverPortal({ ...props }: PopoverPrimitive.Portal.Props) {
  return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />;
}

function PopoverClose({ ...props }: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  side = "bottom",
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "side" | "align" | "sideOffset">) {
  return (
    <PopoverPortal>
      <PopoverPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "text-ink-900 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 border-hairline z-50 w-72 rounded-none border bg-white p-4 text-sm shadow-md duration-150 outline-none",
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPortal>
  );
}

function PopoverArrow({ className, ...props }: PopoverPrimitive.Arrow.Props) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      className={cn(
        "data-side[data-side=bottom]:-top-1 data-side[data-side=left]:-right-1 data-side[data-side=right]:-left-1 data-side[data-side=top]:-bottom-1 stroke-ink-900 fill-white [&>svg]:size-3 [&>svg]:stroke-2",
        className,
      )}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-body-sm-strong text-ink-900 mb-1", className)}
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-body-sm text-ink-500", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverPortal,
  PopoverClose,
  PopoverContent,
  PopoverArrow,
  PopoverTitle,
  PopoverDescription,
};
