import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * thriftedBD button variants — WISE design system §7.1.
 * Primary actions are lime-green pills with near-black ink text.
 * Filled buttons use a hard offset shadow that flattens on press.
 * See DESIGN.md for the full WISE component spec.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border-2 border-transparent rounded-xl text-base font-semibold whitespace-nowrap transition-all duration-150 ease-brand outline-none select-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-green-500 text-ink-900 shadow-brutal-sm hover:bg-green-600 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        secondary:
          "bg-ink-50 text-ink-900 shadow-brutal-sm hover:bg-ink-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        outline:
          "border-ink-900 bg-white text-ink-900 shadow-brutal-sm hover:bg-ink-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        ghost: "bg-transparent text-ink-700 hover:bg-ink-100",
        link: "bg-transparent p-0 text-green-700 hover:underline",
        destructive:
          "bg-sale-500 text-white shadow-brutal-sm hover:bg-sale-700 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6",
        lg: "h-12 px-8",
        icon: "size-11 rounded-full",
        "icon-sm": "size-9 rounded-full",
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
