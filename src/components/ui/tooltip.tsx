"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({ ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} />;
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  // data-slot omitted - see DialogTrigger (avoids a base-ui SSR/client hydration mismatch).
  return <TooltipPrimitive.Trigger {...props} />;
}

function TooltipPortal({ ...props }: TooltipPrimitive.Portal.Props) {
  return <TooltipPrimitive.Portal data-slot="tooltip-portal" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 4,
  side = "top",
  ...props
}: TooltipPrimitive.Popup.Props & Pick<TooltipPrimitive.Positioner.Props, "side" | "sideOffset">) {
  return (
    <TooltipPortal>
      <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset} className="isolate z-50">
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-ink-900 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 text-caption z-50 overflow-hidden rounded-none px-3 py-1.5 text-white duration-150",
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPortal>
  );
}

function TooltipArrow({ className, ...props }: TooltipPrimitive.Arrow.Props) {
  return (
    <TooltipPrimitive.Arrow
      data-slot="tooltip-arrow"
      className={cn(
        "data-side[data-side=bottom]:-top-1 data-side[data-side=left]:-right-1 data-side[data-side=right]:-left-1 data-side[data-side=top]:-bottom-1 fill-ink-900 stroke-ink-800 [&>svg]:size-3 [&>svg]:stroke-2",
        className,
      )}
      {...props}
    />
  );
}

export { Tooltip, TooltipArrow, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger };
