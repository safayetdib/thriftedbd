"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

function getPageRange(current: number, total: number, siblings: number) {
  const totalVisible = siblings * 2 + 5;
  if (total <= totalVisible) {
    return {
      pages: Array.from({ length: total }, (_, i) => i + 1),
    };
  }

  const leftSiblingIndex = Math.max(current - siblings, 1);
  const rightSiblingIndex = Math.min(current + siblings, total);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < total - 1;

  const pages: (number | "...")[] = [1];
  if (showLeftEllipsis) pages.push("...");
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== total) pages.push(i);
  }
  if (showRightEllipsis) pages.push("...");
  if (total > 1) pages.push(total);

  return { pages };
}

export function Pagination({
  currentPage,
  totalPages,
  baseParams,
}: {
  currentPage: number;
  totalPages: number;
  baseParams: Record<string, string | undefined>;
}) {
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams(baseParams as Record<string, string>);
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  };

  const { pages } = getPageRange(currentPage, totalPages, 1);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      <Link
        href={buildHref(currentPage - 1)}
        aria-label="Previous page"
        className={cn(
          "border-hairline text-caption-md rounded-pill flex items-center gap-1 border px-4 py-2 transition-colors",
          currentPage <= 1
            ? "border-hairline-soft text-stone pointer-events-none"
            : "text-ink-900 hover:border-ink-900 bg-white",
        )}
        aria-disabled={currentPage <= 1}
        tabIndex={currentPage <= 1 ? -1 : undefined}
      >
        <CaretLeftIcon size={14} weight="bold" />
        <span className="hidden sm:inline">Prev</span>
      </Link>

      <div className="flex items-center gap-1">
        {pages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="text-mute text-caption-md flex size-10 items-center justify-center"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildHref(page)}
              className={cn(
                "text-caption-md flex size-10 items-center justify-center rounded-full border transition-colors",
                page === currentPage
                  ? "bg-ink-900 border-ink-900 text-white"
                  : "border-hairline text-ink-900 hover:border-ink-900 bg-white",
              )}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      <Link
        href={buildHref(currentPage + 1)}
        aria-label="Next page"
        className={cn(
          "border-hairline text-caption-md rounded-pill flex items-center gap-1 border px-4 py-2 transition-colors",
          currentPage >= totalPages
            ? "border-hairline-soft text-stone pointer-events-none"
            : "text-ink-900 hover:border-ink-900 bg-white",
        )}
        aria-disabled={currentPage >= totalPages}
        tabIndex={currentPage >= totalPages ? -1 : undefined}
      >
        <span className="hidden sm:inline">Next</span>
        <CaretRightIcon size={14} weight="bold" />
      </Link>
    </nav>
  );
}
