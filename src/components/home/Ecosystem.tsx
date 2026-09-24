"use client";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { services } from "@/lib/services";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";

/* ───────── Proyección isométrica ───────── */
const S = 30;
type V3 = [number, number, number];
const iso = ([x, y, z]: V3): [number, number] => [(x - y) * 0.866 * S, (x + y) * 0.5 * S - z * S];
const pts = (vs: V3[]) => vs.map((v) => iso(v).map((n) => n.toFixed(1)).join(",")).join(" ");

function Box({
  x, y, z, w, d, h, top = "#12357f", fx = "#071a47", fy = "#0a2560", stroke = "rgba(106,166,255,.35)",
}: { x: number; y: number; z: number; w: number; d: number; h: number; top?: string; fx?: string; fy?: string; stroke?: string }) {
  return (
    <g stroke={stroke} strokeWidth={1} strokeLinejoin="round">
      <polygon fill={fy} points={pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} />
      <polygon fill={fx} points={pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} />
      <polygon fill={top} points={pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} />
    </g>
  );
}
/** Rectángulo sobre la cara Y (plano y = const) */
const rectY = (y: number, x0: number, x1: number, z0: number, z1: number) => pts([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]);
/** Rectángulo sobre la cara X (plano x = const) */
const rectX = (x: number, y0: number, y1: number, z0: number, z1: number) => pts([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]);

/* ───────── Puntos de interés ───────── */
const HUB: V3 = [5.3, 0.9, 6.6];
const SPOTS: Record<string, V3> = {
  cctv: [6, 5, 4.6],
  "energia-solar": [2.8, 2.4, 5.4],
  "automatizacion-de-puertas": [8, 5, 1.2],
  domotica: [1.2, 5, 3.45],
  "cableado-estructurado": [6, 2.2, 3.55],
  ups: [11, 4.1, 1.55],
  "servicios-informaticos": [4.8, 5, 1.45],
};

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

        <div className="mt-8 grid items-center gap-4 sm:mt-14 sm:gap-10 lg:grid-cols-[340px_1fr]">
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
              </li>
            ))}
          </ul>

          {/* Escena isométrica */}
          <div className="relative lg:order-2">
            <svg viewBox="-240 -215 820 500" data-paused={inView ? undefined : ""} className="-mx-[12%] w-[124%] max-w-none sm:mx-0 sm:w-full" role="img" aria-label="Edificio con los servicios de INNOVA">
              <defs>
                <linearGradient id="glowWin" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#6aa6ff" />
                  <stop offset="1" stopColor="#0660d8" />
                </linearGradient>
                <linearGradient id="warmWin" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#f2f86a" />
                  <stop offset="1" stopColor="#e9b705" />
                </linearGradient>
                <linearGradient id="panel" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#2f7ff0" />
                  <stop offset="1" stopColor="#042874" />
                </linearGradient>
                <radialGradient id="cone">
                  <stop offset="0" stopColor="#e9f205" stopOpacity=".5" />
                  <stop offset="1" stopColor="#e9f205" stopOpacity="0" />
                </radialGradient>
                <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
                <clipPath id="doorClip">
                  <polygon points={rectY(5, 6.6, 9.6, 0, 2.1)} />
                </clipPath>
              </defs>

              {/* Terreno */}
              <polygon points={pts([[-1.5, -1.5, 0], [13.5, -1.5, 0], [13.5, 9.5, 0], [-1.5, 9.5, 0]])} fill="#051536" stroke="rgba(106,166,255,.25)" />
              {Array.from({ length: 14 }, (_, i) => (
                <line key={"gx" + i} x1={iso([i - 0.5, -1.5, 0])[0]} y1={iso([i - 0.5, -1.5, 0])[1]} x2={iso([i - 0.5, 9.5, 0])[0]} y2={iso([i - 0.5, 9.5, 0])[1]} stroke="rgba(106,166,255,.08)" />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={"gy" + i} x1={iso([-1.5, i - 0.5, 0])[0]} y1={iso([-1.5, i - 0.5, 0])[1]} x2={iso([13.5, i - 0.5, 0])[0]} y2={iso([13.5, i - 0.5, 0])[1]} stroke="rgba(106,166,255,.08)" />
              ))}
              {/* Vía de acceso */}
              <polygon points={pts([[6.4, 5, 0.01], [9.6, 5, 0.01], [9.6, 9.5, 0.01], [6.4, 9.5, 0.01]])} fill="#0a2560" opacity=".7" />
              {[6, 7.3, 8.6].map((y) => (
                <polygon key={y} points={pts([[7.9, y, 0.02], [8.1, y, 0.02], [8.1, y + 0.7, 0.02], [7.9, y + 0.7, 0.02]])} fill="#e9f205" opacity=".5" />
              ))}

              {/* Conos de visión de cámaras */}
              <g className={clsx("transition-opacity duration-500", svc.slug === "cctv" ? "opacity-100" : "opacity-40")}>
                <polygon className="eco-breathe" points={pts([[6.1, 5.1, 4.3], [4.5, 9.2, 0], [9.2, 8.4, 0]])} fill="url(#cone)" />
                <polygon className="eco-breathe" style={{ animationDelay: "-1.2s" }} points={pts([[10.1, 5.1, 2.4], [10.2, 9.4, 0], [13.4, 6.4, 0]])} fill="url(#cone)" />
              </g>

              {/* UPS */}
              <Box x={10.5} y={3.6} z={0} w={1} d={1} h={1.3} top="#1a3f8f" />
              {[0.3, 0.55, 0.8].map((z, i) => (
                <polygon
                  key={z}
                  points={rectY(4.6, 10.65, 11.35, z, z + 0.14)}
                  fill="#e9f205"
                  className={svc.slug === "ups" ? "eco-blink" : undefined}
                  opacity={svc.slug === "ups" ? undefined : 0.35}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}

              {/* Garaje */}
              <Box x={6} y={1} z={0} w={4.2} d={4} h={2.6} />
              {/* Puerta seccional */}
              <polygon points={rectY(5, 6.6, 9.6, 0, 2.1)} fill="#031029" stroke="rgba(106,166,255,.4)" />
              <g clipPath="url(#doorClip)">
                <g className={svc.slug === "automatizacion-de-puertas" ? "eco-door" : undefined}>
                  <polygon points={rectY(5, 6.6, 9.6, 0, 2.1)} fill="#1d4a9e" />
                  {[0.42, 0.84, 1.26, 1.68].map((z) => (
                    <line key={z} x1={iso([6.6, 5, z])[0]} y1={iso([6.6, 5, z])[1]} x2={iso([9.6, 5, z])[0]} y2={iso([9.6, 5, z])[1]} stroke="rgba(106,166,255,.45)" />
                  ))}
                </g>
              </g>
              {/* Paneles en el garaje */}
              {[1.4, 2.9].map((y) =>
                [6.4, 8.2].map((x) => (
                  <polygon key={`${x}-${y}`} points={pts([[x, y, 2.95], [x + 1.6, y, 2.95], [x + 1.6, y + 1.3, 2.65], [x, y + 1.3, 2.65]])} fill="url(#panel)" stroke="#6aa6ff" strokeWidth=".6" opacity=".9" />
                )),
              )}

              {/* Edificio principal */}
              <Box x={0} y={0} z={0} w={6} d={5} h={4.5} top="#0f2f74" />
              {/* Línea de entrepiso */}
              <line x1={iso([0, 5, 2.4])[0]} y1={iso([0, 5, 2.4])[1]} x2={iso([6, 5, 2.4])[0]} y2={iso([6, 5, 2.4])[1]} stroke="rgba(106,166,255,.3)" />
              {/* Ventanas cara Y */}
              {[
                [0.6, 1.8, 2.9, 4.0, "warm"],
                [2.4, 3.6, 2.9, 4.0, "blue"],
                [4.2, 5.4, 2.9, 4.0, "blue"],
                [0.6, 1.8, 0.9, 2.0, "dim"],
                [4.2, 5.4, 0.9, 2.0, "pc"],
              ].map(([x0, x1, z0, z1, t], i) => (
                <polygon
                  key={i}
                  points={rectY(5, x0 as number, x1 as number, z0 as number, z1 as number)}
                  fill={t === "warm" ? "url(#warmWin)" : t === "blue" || t === "pc" ? "url(#glowWin)" : "#082060"}
                  opacity={
                    t === "warm"
                      ? svc.slug === "domotica" ? 1 : 0.55
                      : t === "pc"
                        ? svc.slug === "servicios-informaticos" ? 1 : 0.5
                        : 0.6
                  }
                  className="transition-opacity duration-500"
                  stroke="rgba(255,255,255,.25)"
                  strokeWidth=".6"
                />
              ))}
              {/* Monitor en ventana (informática) */}
              <polygon points={rectY(5.001, 4.45, 5.15, 1.15, 1.7)} fill="#020817" opacity=".85" />
              <polygon points={rectY(5.002, 4.52, 5.08, 1.22, 1.62)} fill="#6aa6ff" opacity={svc.slug === "servicios-informaticos" ? 0.9 : 0.4} />
              {/* Bombillo (domótica) */}
              <circle cx={iso([1.2, 5, 3.7])[0]} cy={iso([1.2, 5, 3.7])[1]} r={svc.slug === "domotica" ? 16 : 0} fill="#f2f86a" filter="url(#blur6)" opacity=".7" className="transition-all duration-500" />
              {/* Puerta de entrada */}
              <polygon points={rectY(5, 2.5, 3.5, 0, 1.9)} fill="#031029" stroke="rgba(106,166,255,.5)" strokeWidth=".8" />
              <circle cx={iso([3.35, 5, 0.95])[0]} cy={iso([3.35, 5, 0.95])[1]} r="1.6" fill="#e9f205" />

              {/* Ventanas cara X (con rack) */}
              <polygon points={rectX(6, 1.0, 2.9, 2.9, 4.0)} fill="#041440" stroke="rgba(255,255,255,.25)" strokeWidth=".6" />
              {[3.05, 3.3, 3.55, 3.8].map((z, i) => (
                <g key={z}>
                  <polygon points={rectX(6.001, 1.3, 2.6, z, z + 0.16)} fill="#0b2c73" />
                  {[1.45, 1.7, 1.95, 2.2].map((y, j) => (
                    <circle
                      key={y}
                      className="eco-blink"
                      cx={iso([6.002, y, z + 0.08])[0]}
                      cy={iso([6.002, y, z + 0.08])[1]}
                      r="1.3"
                      fill={j % 2 ? "#e9f205" : "#6aa6ff"}
                      style={{ animationDuration: `${0.6 + ((i + j) % 4) * 0.35}s` }}
                    />
                  ))}
                </g>
              ))}
              <polygon points={rectX(6, 3.3, 4.5, 2.9, 4.0)} fill="url(#glowWin)" opacity=".45" stroke="rgba(255,255,255,.25)" strokeWidth=".6" />

              {/* Paneles solares techo principal */}
              {[0.4, 1.9, 3.4].map((y) =>
                [0.4, 2.3, 4.2].map((x) => (
                  <polygon
                    key={`${x}-${y}`}
                    points={pts([[x, y, 5.15], [x + 1.6, y, 5.15], [x + 1.6, y + 1.25, 4.72], [x, y + 1.25, 4.72]])}
                    fill="url(#panel)"
                    stroke="#6aa6ff"
                    strokeWidth=".6"
                    className={svc.slug === "energia-solar" ? "eco-breathe" : undefined}
                    opacity={svc.slug === "energia-solar" ? undefined : 0.85}
                    style={{ animationDelay: `${(x + y) * 0.1}s` }}
                  />
                )),
              )}

              {/* Antena / hub */}
              <line x1={iso([5.3, 0.9, 4.5])[0]} y1={iso([5.3, 0.9, 4.5])[1]} x2={hub[0]} y2={hub[1]} stroke="#6aa6ff" strokeWidth="2" />
              <circle cx={hub[0]} cy={hub[1]} r="5" fill="#e9f205" />
              {[0, 1, 2].map((i) => (
                <circle
                  key={i}
                  cx={hub[0]}
                  cy={hub[1]}
                  r={38}
                  fill="none"
                  stroke="#e9f205"
                  strokeWidth={0.8}
                  className="eco-ring"
                  style={{ animationDelay: `${i * 0.8}s` }}
                />
              ))}

              {/* Cámaras */}
              {([[6.05, 5.05, 4.35], [10.25, 5.05, 2.45], [0, 5.05, 4.35]] as V3[]).map((c, i) => {
                const [x, y] = iso(c);
                return (
                  <g key={i} transform={`translate(${x} ${y})`}>
                    <rect x="-3" y="-8" width="4" height="8" fill="#cfd8e3" />
                    <rect x="-9" y="-2" width="17" height="8" rx="2" fill="#f1f6fa" transform="rotate(22)" />
                    <circle cx="7" cy="6" r="2.4" fill="#020817" />
                  </g>
                );
              })}

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
                className="-mt-4 rounded-3xl border border-white/10 bg-navy-900/80 p-5 backdrop-blur-xl sm:absolute sm:bottom-0 sm:right-0 sm:mt-0 sm:max-w-sm"
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
