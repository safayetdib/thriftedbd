import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="max-w-container mx-auto px-4 py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Gallery skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-square w-full" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="size-16 shrink-0" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="flex flex-col gap-5">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/4" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
