import Link from "next/link";
import { cn } from "@/lib/utils";

function getPageRange(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  if (total > 1) pages.push(total);

  return pages;
}

export function AdminPagination({
  currentPage,
  totalPages,
  basePath,
  params,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageRange(currentPage, totalPages);

  const buildHref = (page: number) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, value);
    }
    if (page === 1) {
      searchParams.delete("page");
    } else {
      searchParams.set("page", String(page));
    }
    const qs = searchParams.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="text-ink-400 flex h-9 w-9 items-center justify-center text-sm"
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className={cn(
              "flex h-9 w-9 items-center justify-center border-2 text-xs font-bold transition-colors",
              page === currentPage
                ? "bg-ink-900 border-ink-900 text-white"
                : "border-ink-900 text-ink-900 hover:bg-ink-100 bg-white",
            )}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        ),
      )}
    </div>
  );
}
