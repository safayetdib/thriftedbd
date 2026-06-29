import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * thriftedBD badge variants — see design system §7.7.
 * Sharp corners, 2px ink border on every variant (funky/modern direction).
 */
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-pill border-2 border-ink-900 px-2.5 py-1 text-xs font-bold whitespace-nowrap transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        new: "bg-green-500 text-white",
        imported: "bg-white text-ink-900",
        premium: "bg-ink-900 text-amber-400",
        sale: "bg-sale-500 text-white",
        sold: "border-ink-300 bg-ink-300 text-ink-700",
      },
    },
    defaultVariants: {
      variant: "new",
    },
  },
);

function Badge({
  className,
  variant = "new",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
