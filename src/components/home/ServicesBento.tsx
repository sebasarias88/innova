import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/services";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

// Distribución del bento (desktop 4 columnas)
const layout: Record<string, string> = {
  cctv: "lg:col-span-2 lg:row-span-2",
  "energia-solar": "lg:col-span-2",
  "automatizacion-de-puertas": "",
  domotica: "",
  "cableado-estructurado": "",
  ups: "",
  "servicios-informaticos": "lg:col-span-2",
};

export function ServicesBento() {
  return (
    <section className="relative bg-ice-50 py-24 text-navy-900 sm:py-32">
      <div className="grid-bg-light absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Eyebrow dark>Nuestros servicios</Eyebrow>
            <h2 className="mt-5 max-w-3xl text-balance text-4xl font-bold leading-[1] tracking-tight sm:text-6xl">
              Soluciones de alta tecnología <span className="text-royal-500">a tu medida.</span>
            </h2>
          </div>
          <p className="max-w-md text-pretty text-lg text-navy-900/65">
            Instalación, mantenimiento, reparación y suministro de productos de calidad para hogares, empresas e industrias.
          </p>
        </div>

        <div className="mt-14 grid auto-rows-[minmax(260px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const big = s.slug === "cctv";
            return (
              <Reveal key={s.slug} delay={(i % 4) * 0.06} className={clsx(layout[s.slug])}>
                <Link href={`/servicios/${s.slug}`} className="block h-full">
                  <SpotlightCard className="h-full border-navy-900/10 bg-navy-900">
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      sizes={big ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                      className="object-cover opacity-55 transition duration-700 group-hover:scale-105 group-hover:opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/10" />
                    <div className={clsx("relative z-20 flex h-full flex-col justify-between p-6", big && "sm:p-9")}>
                      <div className="flex items-start justify-between">
                        <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur-md transition-colors duration-300 group-hover:bg-lime-400 group-hover:text-navy-900">
                          <Icon name={s.icon} className="size-6" />
                        </span>
                        <span className="grid size-10 place-items-center rounded-full border border-white/20 text-white transition-all duration-300 group-hover:rotate-45 group-hover:border-lime-400 group-hover:bg-lime-400 group-hover:text-navy-900">
                          <ArrowUpRight className="size-4" />
                        </span>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime-400">{s.kicker}</p>
                        <h3 className={clsx("mt-2 font-bold leading-tight tracking-tight text-white", big ? "text-3xl sm:text-5xl" : "text-2xl")}>
                          {s.name}
                        </h3>
                        <p className={clsx("mt-3 text-pretty text-white/65", big ? "max-w-md text-base" : "text-sm")}>{s.short}</p>
                        {big && (
                          <ul className="mt-6 hidden flex-wrap gap-2 sm:flex">
                            {s.includes.map((inc) => (
                              <li key={inc} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
                                {inc}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
