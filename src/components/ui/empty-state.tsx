import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyTableRow({
  colSpan,
  message = "No data yet.",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-ink-500 px-4 py-8 text-center text-sm">
        {message}
      </td>
    </tr>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  bordered = true,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 p-8 text-center",
        bordered && "border-ink-900 border-2 bg-white",
        className,
      )}
    >
      {icon && <div className="text-ink-300">{icon}</div>}
      <p className="text-ink-700 font-medium">{title}</p>
      {description && <p className="text-ink-500 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
