import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="max-w-container mx-auto flex flex-col gap-8 px-4 py-8">
      <Skeleton className="h-8 w-48" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-ink-900 flex gap-4 border-2 bg-white p-4">
              <Skeleton className="size-24 shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="mt-auto h-4 w-1/6" />
              </div>
            </div>
          ))}
        </div>

        <div className="border-ink-900 flex h-fit flex-col gap-4 border-2 bg-white p-6">
          <Skeleton className="h-6 w-1/2" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
