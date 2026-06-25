import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * thriftedBD button variants — see design system §7.1.
 * Pill radius, 44px+ tap targets, green as the only primary action color.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-pill border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-200 ease-brand outline-none select-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-green-500 text-white hover:bg-green-600 active:bg-green-700",
        secondary: "bg-ink-900 text-ink-50 hover:bg-ink-800",
        outline: "border-ink-300 bg-transparent text-ink-900 hover:bg-ink-100",
        ghost: "border-transparent bg-transparent text-ink-700 hover:bg-ink-100",
        link: "border-transparent bg-transparent p-0 text-green-700 hover:underline",
        destructive: "bg-sale-500 text-white hover:bg-sale-700",
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
