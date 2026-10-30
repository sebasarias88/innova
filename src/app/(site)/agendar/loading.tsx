import { PageHeroSkeleton, Skeleton, SkeletonRegion } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonRegion label="Cargando la agenda…">
      <PageHeroSkeleton withChip={false} />
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    </SkeletonRegion>
  );
}
