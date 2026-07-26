import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * thriftedBD badge variants - Nike design system.
 * Nike's promo badge is a borderless white pill in caption-sm, floated over
 * photography. Sale is signalled with red *text*, never a red fill, so the only
 * chromatic moment on a product tile stays the price. See DESIGN.md →
 * Components → badge-promo / badge-sale-text.
 */
const badgeVariants = cva(
  "group/badge text-caption-sm inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-pill px-3 py-1 whitespace-nowrap transition-colors has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        new: "bg-white text-ink-900",
        imported: "bg-ink-50 text-ink-900",
        premium: "bg-ink-900 text-white",
        sale: "bg-white text-sale-500",
        sold: "bg-ink-50 text-mute",
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
