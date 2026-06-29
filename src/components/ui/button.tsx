import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * thriftedBD button variants — see design system §7.1.
 * Sharp corners (radius token is 0), 44px+ tap targets, green as the only
 * primary action color. Filled/outline variants get a 2px ink border + hard
 * offset shadow that flattens on press — the signature funky/modern device.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-pill border-2 border-transparent text-sm font-semibold whitespace-nowrap transition-all duration-150 ease-brand outline-none select-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "border-ink-900 bg-green-500 text-white shadow-brutal-sm hover:bg-green-600 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        secondary:
          "border-ink-900 bg-ink-900 text-ink-50 shadow-brutal-sm hover:bg-ink-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        outline:
          "border-ink-900 bg-white text-ink-900 shadow-brutal-sm hover:bg-ink-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        ghost: "border-transparent bg-transparent text-ink-700 hover:bg-ink-100",
        link: "border-transparent bg-transparent p-0 text-green-700 hover:underline",
        destructive:
          "border-ink-900 bg-sale-500 text-white shadow-brutal-sm hover:bg-sale-700 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
