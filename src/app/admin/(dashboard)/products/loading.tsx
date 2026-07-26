import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="rounded-pill h-10 w-32" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="rounded-pill h-8 w-24" />
        ))}
      </div>

      <div className="border-hairline overflow-x-auto rounded-none border bg-white">
        <div className="border-hairline bg-soft-cloud border-b">
          <div className="flex gap-4 px-5 py-3.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-hairline-soft border-b px-5 py-3.5 last:border-0">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
