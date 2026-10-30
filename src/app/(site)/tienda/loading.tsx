import { PageHeroSkeleton, ProductGridSkeleton, Skeleton, SkeletonRegion } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonRegion label="Cargando la tienda…">
      <PageHeroSkeleton />
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex min-w-0 gap-2 overflow-hidden lg:flex-1">
            {[64, 120, 150, 70, 110, 100].map((w, i) => (
              <Skeleton key={i} className="h-11 shrink-0 rounded-full" style={{ width: w }} />
            ))}
          </div>
          <Skeleton className="h-12 rounded-full lg:w-96 lg:shrink-0" />
        </div>
        <ProductGridSkeleton />
      </div>
    </SkeletonRegion>
  );
}
