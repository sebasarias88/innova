import { PageHeroSkeleton, Skeleton, SkeletonRegion } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonRegion label="Cargando tu carrito…">
      <PageHeroSkeleton withChip={false} />
      <div className="mx-auto grid max-w-7xl items-start gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </SkeletonRegion>
  );
}
