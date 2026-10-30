"use client";

import { useEffect, useTransition } from "react";
import { RotateCw } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { BusyContent } from "@/components/ui/Busy";
import { waLink } from "@/lib/site";
import { newTab } from "@/lib/whatsapp";

/** Something failed loading this page: retry, or keep selling by WhatsApp. */
export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const [pending, start] = useTransition();
  useEffect(() => console.error("[site] page error", error.digest ?? error.message), [error]);

  return (
    <section className="grid min-h-[80vh] place-items-center px-4 pt-24 text-center">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-amber-300">● Interferencia en la señal</p>
        <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">No pudimos cargar esta página</h1>
        <p className="mx-auto mt-4 max-w-md text-white/60">Puede ser tu conexión o un problema momentáneo nuestro. Inténtalo de nuevo o escríbenos: te atendemos por WhatsApp.</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={waLink("Hola, INNOVA 👋 La página no me cargó. Quisiera hacer un pedido o una consulta.")}
            {...newTab}
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 font-semibold text-navy-950 hover:brightness-110"
          >
            <WhatsAppIcon className="size-5" /> Pedir por WhatsApp
          </a>
          <button
            type="button"
            disabled={pending}
            aria-busy={pending}
            onClick={() =>
              start(() => {
                retry();
              })
            }
            className="relative inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-semibold text-white hover:border-lime-400 hover:text-lime-300 disabled:cursor-wait"
          >
            <BusyContent busy={pending}>
              <RotateCw className="size-4" /> Reintentar
            </BusyContent>
          </button>
        </div>
      </div>
    </section>
  );
}
