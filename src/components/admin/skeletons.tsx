import { Skeleton, SkeletonRegion } from "@/components/ui/Skeleton";

function HeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div className="space-y-2.5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {action && <Skeleton className="h-10 w-36 rounded-full" />}
    </div>
  );
}

/** Lists (orders, products, categories…): filters + table rows. */
export function TablePageSkeleton({ label, action, rows = 8 }: { label: string; action?: boolean; rows?: number }) {
  return (
    <SkeletonRegion label={label} className="mx-auto max-w-6xl">
      <HeaderSkeleton action={action} />
      <div className="mb-5 flex flex-wrap gap-2">
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <Skeleton className="h-11 rounded-none" />
        <div className="divide-y divide-white/5">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="size-11 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="hidden h-4 w-24 sm:block" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonRegion>
  );
}

/** Numbers + chart + ranked lists (dashboard, reports, visits, storage). */
export function StatsPageSkeleton({ label, picker = true }: { label: string; picker?: boolean }) {
  return (
    <SkeletonRegion label={label} className="mx-auto max-w-6xl">
      <HeaderSkeleton />
      {picker && <Skeleton className="mb-5 h-14 rounded-2xl" />}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-64 rounded-2xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-white/10 p-5">
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton key={j} className="h-6" />
            ))}
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** Edit screens: main form + side card. */
export function FormPageSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label} className="mx-auto max-w-6xl">
      <Skeleton className="mb-4 h-4 w-24" />
      <HeaderSkeleton action />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-4 rounded-2xl border border-white/10 p-6">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-11" />
              <Skeleton className="h-20" />
              <Skeleton className="h-11" />
            </div>
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-white/10 p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-11" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-11 rounded-full" />
        </div>
      </div>
    </SkeletonRegion>
  );
}
