import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="max-w-container mx-auto flex flex-col gap-12 px-4 py-8">
      <div className="flex items-start gap-8">
        <div className="hidden w-64 shrink-0 gap-4 lg:flex lg:flex-col">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex justify-end">
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
