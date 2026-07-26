import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * thriftedBD button variants - Nike design system.
 * Every actionable surface is a full pill. Primary is solid black
 * on light surfaces; secondary is soft-cloud grey. There are no
 * shadows and no sharp corners anywhere in the system, and only one
 * filled CTA appears per surface. See DESIGN.md → Components → Buttons.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-base font-medium whitespace-nowrap transition-colors duration-150 ease-brand outline-none select-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-ink-900 text-white hover:bg-ink-800",
        secondary: "bg-ink-50 text-ink-900 hover:bg-ink-100",
        outline: "border border-ink-900 bg-white text-ink-900 hover:bg-ink-50",
        // On-image CTAs - for campaign photography and ink-900 sections, where
        // `primary` would render black-on-black. DESIGN.md → button-outline-on-image.
        "on-image": "bg-white text-ink-900 hover:bg-ink-50",
        "on-image-ghost": "border border-white bg-transparent text-white hover:bg-white/10",
        ghost: "bg-transparent text-ink-700 hover:bg-ink-50",
        link: "bg-transparent p-0 text-ink-900 underline underline-offset-2 hover:text-ink-700",
        destructive: "bg-sale-500 text-white hover:bg-sale-700",
      },
      size: {
        sm: "h-10 px-6 text-sm",
        md: "h-12 px-8",
        lg: "h-14 px-10",
        icon: "size-10",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="size-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
