"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import clsx from "clsx";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { getService } from "@/lib/services";

const TABS = [
  {
    id: "hogar",
    label: "Hogar",
    short: "Hogar",
    icon: "Home",
    image: "/img/domotica-tablet.webp",
    title: "Tu familia segura y tu casa más inteligente.",
    points: [
      "Mira tu casa desde el celular cuando viajas",
      "Abre el garaje sin bajarte del carro",
      "Paga menos energía con paneles solares",
      "Luces y clima que se adaptan a ti",
    ],
    services: ["cctv", "domotica", "automatizacion-de-puertas", "energia-solar"],
  },
  {
    id: "empresa",
    label: "Empresa y comercio",
    short: "Empresa",
    icon: "Store",
    image: "/img/redes-tecnico.webp",
    title: "Tu negocio protegido, conectado y siempre operando.",
    points: [
      "Controla inventario, cajas y accesos con cámaras",
      "Red de datos ordenada y certificada",
      "Tus equipos siguen trabajando aunque se vaya la luz",
      "Soporte técnico y mantenimiento preventivo",
    ],
    services: ["cctv", "cableado-estructurado", "ups", "servicios-informaticos"],
  },
  {
    id: "industria",
    label: "Industria",
    short: "Industria",
    icon: "Factory",
    image: "/img/tecnico-torre.webp",
    title: "Continuidad operativa para proyectos de gran escala.",
    points: [
      "Videovigilancia perimetral de largo alcance",
      "Puertas industriales seccionales y enrollables",
      "Energía solar y respaldo para reducir costos",
      "Infraestructura de red bajo normativa internacional",
    ],
    services: ["cctv", "automatizacion-de-puertas", "energia-solar", "ups"],
  },
] as const;

export function Audience() {
  const [tab, setTab] = useState(0);
  const t = TABS[tab];

  return (
    <section className="relative overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <Eyebrow>Para quién trabajamos</Eyebrow>
            <h2 className="mt-5 max-w-2xl text-balance text-4xl font-bold leading-[1] tracking-tight text-white sm:text-6xl">
              Una solución para cada espacio.
            </h2>
          </div>
          <div className="grid w-full grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 sm:flex sm:w-auto sm:p-1.5">
            {TABS.map((x, i) => (
              <button
                key={x.id}
                onClick={() => setTab(i)}
                className={clsx(
                  "relative flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-2 py-2.5 text-[13px] font-semibold transition-colors sm:px-5 sm:text-sm",
                  i === tab ? "text-navy-900" : "text-white/70 hover:text-white",
                )}
              >
                {i === tab && (
                  <motion.span layoutId="aud-pill" className="absolute inset-0 rounded-full bg-lime-400" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <Icon name={x.icon} className="relative hidden size-4 sm:block" />
                <span className="relative">{x.short}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] lg:aspect-auto lg:min-h-[520px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={t.id}
                className="absolute inset-0"
                initial={{ clipPath: "inset(0 0 0 100%)" }}
                animate={{ clipPath: "inset(0 0 0 0%)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image src={t.image} alt={t.label} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-5 left-5 rounded-full bg-navy-950/70 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-lime-400 backdrop-blur">
              {t.label}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-10"
            >
              <div>
                <h3 className="text-balance text-[1.7rem] font-bold leading-tight tracking-tight text-white sm:text-4xl">{t.title}</h3>
                <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-white/80">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-lime-400/15 text-lime-400">
                        <Check className="size-3.5" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Servicios recomendados</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {t.services.map((slug) => {
                    const s = getService(slug)!;
                    return (
                      <Link
                        key={slug}
                        href={`/servicios/${slug}`}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 p-3 text-sm font-medium text-white transition-colors hover:border-lime-400/50 hover:bg-lime-400/5"
                      >
                        <Icon name={s.icon} className="size-5 shrink-0 text-royal-300" />
                        <span className="leading-tight">{s.name}</span>
                      </Link>
                    );
                  })}
                </div>
                <Button href={`/arma-tu-sistema?tipo=${t.id}`} className="mt-6" icon={<ArrowRight className="size-3.5" />}>
                  Armar mi sistema
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
