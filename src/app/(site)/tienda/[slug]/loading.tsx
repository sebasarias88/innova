import { Skeleton, SkeletonRegion } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonRegion label="Cargando el producto…" className="pb-16 pt-28 sm:pb-24 sm:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Skeleton className="mb-6 h-4 w-40" />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="mt-3 flex gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="size-20 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-11/12" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-11 w-48" />
            <div className="grid gap-2.5 pt-3 sm:grid-cols-2">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-14 w-64 rounded-full" />
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}
