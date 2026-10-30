import { Skeleton, SkeletonRegion } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Busy";

/** Shown while the payment status is confirmed with Wompi. */
export default function Loading() {
  return (
    <section className="pb-20 pt-28 sm:pb-28 sm:pt-36">
      <SkeletonRegion label="Verificando tu pago…" className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 text-white/70">
            <Spinner className="size-7" label="Verificando tu pago…" />
          </span>
          <p className="mt-6 text-2xl font-bold text-white">Verificando tu pago…</p>
          <p className="mx-auto mt-3 max-w-md text-white/60">Estamos consultando el resultado con Wompi. No cierres esta página.</p>
          <div className="mx-auto mt-8 max-w-md space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      </SkeletonRegion>
    </section>
  );
}
