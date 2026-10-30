import clsx from "clsx";
import type { ReactNode } from "react";

/** A block with the shape of content that is still loading (pulse only when motion is allowed). */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden style={style} className={clsx("rounded-xl bg-white/[0.07] motion-safe:animate-pulse", className)} />;
}

/** Wraps skeletons: announces "Cargando…" to screen readers and marks the area as busy. */
export function SkeletonRegion({ label = "Cargando…", className, children }: { label?: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Same footprint as ProductCard. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-3.5 sm:p-5">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-end justify-between pt-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="hidden size-11 rounded-full sm:block" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <SkeletonRegion label="Cargando productos…" className="mt-6">
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** Same footprint as PageHero (title of inner pages). */
export function PageHeroSkeleton({ withChip = true }: { withChip?: boolean }) {
  return (
    <div className="pb-10 pt-28 sm:pb-24 sm:pt-44">
      <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-12 w-11/12 max-w-3xl sm:h-20" />
        <Skeleton className="h-12 w-2/3 max-w-xl sm:h-20" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        {withChip && <Skeleton className="h-10 w-72 rounded-full" />}
      </div>
    </div>
  );
}
