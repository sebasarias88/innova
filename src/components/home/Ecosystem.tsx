"use client";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { services } from "@/lib/services";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HUB, IsometricScene, SPOTS, iso } from "@/components/home/IsometricScene";

export function Ecosystem() {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { margin: "-20%" });
  const svc = services[active];

  useEffect(() => {
    if (touched || !inView) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % services.length), 3800);
    return () => clearTimeout(t);
  }, [active, touched, inView]);

  // En móvil, mantiene visible el chip activo
  useEffect(() => {
    const ul = listRef.current;
    if (!ul || window.innerWidth >= 640) return;
    const li = ul.children[active] as HTMLElement | undefined;
    if (li) ul.scrollTo({ left: li.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  const pick = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  const hub = iso(HUB);
  const lines = useMemo(
    () =>
      services.map((s) => {
        const [x, y] = iso(SPOTS[s.slug]);
        const cx = (x + hub[0]) / 2;
        const cy = Math.min(y, hub[1]) - 40;
        return `M${x.toFixed(1)},${y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${hub[0].toFixed(1)},${hub[1].toFixed(1)}`;
      }),
    [hub],
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_60%_60%,rgb(6_96_216/0.16),transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <Eyebrow>Un solo aliado</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-tight text-white sm:text-6xl">
            Todo tu espacio, <span className="text-royal-300">protegido y conectado</span> por un mismo equipo.
          </h2>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-white/65">
            Explora cómo INNOVA integra cada sistema en tu hogar, empresa o industria. Toca cada punto para conocer la solución.
          </p>
        </div>

        <div className="mt-8 grid items-center gap-4 sm:mt-14 sm:gap-10 lg:grid-cols-[360px_1fr]">
          {/* Lista */}
          <ul ref={listRef} className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-1.5 sm:overflow-visible sm:px-0 lg:order-1 lg:grid-cols-1 [&::-webkit-scrollbar]:hidden">
            {services.map((s, i) => (
              <li key={s.slug} className="shrink-0 snap-start sm:shrink">
                <button
                  onClick={() => pick(i)}
                  onMouseEnter={() => pick(i)}
                  className={clsx(
                    "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border py-2 pl-2 pr-4 text-left transition-all duration-300 sm:gap-4 sm:px-4 sm:py-3.5",
                    i === active ? "border-lime-400/60 bg-lime-400/10" : "border-white/5 bg-white/[0.02] hover:border-white/15",
                  )}
                >
                  <span className="hidden font-mono text-[11px] text-white/40 sm:inline">0{i + 1}</span>
                  <span
                    className={clsx(
                      "grid size-9 place-items-center rounded-xl transition-colors sm:size-10",
                      i === active ? "bg-lime-400 text-navy-900" : "bg-white/5 text-royal-300",
                    )}
                  >
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <span className={clsx("whitespace-nowrap text-sm font-semibold transition-colors sm:whitespace-normal sm:text-base", i === active ? "text-white" : "text-white/70")}>{s.name}</span>
                  {i === active && !touched && (
                    <span key={active} className="eco-progress absolute bottom-0 left-0 h-0.5 w-full origin-left bg-lime-400" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {i === active && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="hidden overflow-hidden lg:block"
                    >
                      <div className="px-4 pb-1 pt-3">
                        <p className="text-sm leading-relaxed text-white/60">{s.short}</p>
                        <Link href={`/servicios/${s.slug}`} className="group mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-400 hover:text-white">
                          Ver servicio <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>

          {/* Escena isométrica */}
          <div className="relative lg:order-2">
            <svg viewBox="-320 -165 745 548" data-paused={inView ? undefined : ""} className="-mx-[10%] w-[120%] max-w-none sm:mx-0 sm:w-full" role="img" aria-label="Edificio con los servicios de INNOVA">
              <IsometricScene slug={svc.slug} paused={!inView} />

              {/* Antenna beacon */}
              <circle cx={hub[0]} cy={hub[1]} r="5" fill="#e9f205" />
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={hub[0]} cy={hub[1]} r={38} fill="none" stroke="#e9f205" strokeWidth={0.8} className="eco-ring" style={{ animationDelay: `${i * 0.8}s` }} />
              ))}

              {/* Líneas de datos al hub */}
              {lines.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={i === active ? "#e9f205" : "rgba(106,166,255,.35)"}
                  strokeWidth={i === active ? 1.6 : 1}
                  strokeDasharray="3 6"
                  className={i === active ? "eco-dash" : undefined}
                >
                </path>
              ))}

              {/* Hotspots */}
              {services.map((s, i) => {
                const [x, y] = iso(SPOTS[s.slug]);
                const on = i === active;
                return (
                  <g key={s.slug} transform={`translate(${x} ${y})`} className="cursor-pointer" onClick={() => pick(i)} onMouseEnter={() => pick(i)}>
                    {on && (
                      <circle r={26} fill="none" stroke="#e9f205" strokeWidth="1.2" className="eco-ring" />
                    )}
                    <circle r="18" fill="transparent" />
                    <circle r={on ? 12 : 9} fill={on ? "#e9f205" : "#0660d8"} stroke="#fff" strokeWidth="2" className="transition-all duration-300" />
                    <text textAnchor="middle" dy="3.6" fontSize="10" fontWeight="700" fill={on ? "#04112e" : "#fff"} fontFamily="var(--font-mono)">
                      {i + 1}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tarjeta de detalle */}
            <AnimatePresence mode="wait">
              <motion.div
                key={svc.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="-mt-2 rounded-3xl border border-white/10 bg-navy-900/85 p-5 lg:hidden"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-lime-400 text-navy-900">
                    <Icon name={svc.icon} className="size-5" />
                  </span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime-400">{svc.kicker}</p>
                    <p className="font-semibold text-white">{svc.name}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{svc.short}</p>
                <Link href={`/servicios/${svc.slug}`} className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-lime-400">
                  Ver servicio <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
