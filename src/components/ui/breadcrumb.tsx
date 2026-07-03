import * as React from "react";
import { CaretRightIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="Breadcrumb" className={cn("flex items-center", className)} {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol className={cn("text-body-sm flex items-center gap-1.5", className)} {...props} />;
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("flex items-center gap-1.5", className)} {...props} />;
}

function BreadcrumbSeparator({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li className={cn("flex items-center", className)} aria-hidden="true" {...props}>
      <CaretRightIcon className="text-ink-400 size-3" />
    </li>
  );
}

function BreadcrumbLink({ className, ...props }: React.ComponentProps<"a"> & { href: string }) {
  return (
    <a className={cn("text-ink-500 hover:text-ink-900 transition-colors", className)} {...props} />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span className={cn("text-ink-900 font-semibold", className)} aria-current="page" {...props} />
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage,
};
