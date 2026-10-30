"use client";

import { useEffect, useTransition } from "react";
import { RotateCw } from "lucide-react";
import { BusyContent } from "@/components/ui/Busy";

/** A panel page failed to load (connection or database): retry without losing the session. */
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const [pending, start] = useTransition();
  useEffect(() => console.error("[admin] page error", error.digest ?? error.message), [error]);
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-amber-300/30 bg-amber-400/[0.06] p-6 text-center">
      <h1 className="text-xl font-bold">No se pudo cargar esta sección</h1>
      <p className="mt-2 text-sm text-white/60">Puede ser la conexión o un problema momentáneo. Inténtalo de nuevo; tus datos no se perdieron.</p>
      {error.digest && <p className="mt-2 font-mono text-[11px] text-white/35">Código: {error.digest}</p>}
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={() => start(() => retry())}
        className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-white disabled:cursor-wait"
      >
        <BusyContent busy={pending}>
          <RotateCw className="size-4" /> Reintentar
        </BusyContent>
      </button>
    </div>
  );
}
