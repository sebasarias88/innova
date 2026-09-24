"use client";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BatteryCharging, Bell, DoorClosed, Sun, Wifi } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { waLink } from "@/lib/site";

type Box = { x: number; y: number; w: number; h: number; label: string; conf?: number };
type Feed = { cam: string; zone: string; src: string; aspect: number; boxes: Box[] };

/** Coordenadas de las cajas normalizadas sobre la imagen original (0–1). */
const FEEDS: Feed[] = [
  {
    cam: "CAM-01",
    zone: "Cuarto de red",
    src: "/img/redes-tecnico.jpg",
    aspect: 1020 / 1070,
    boxes: [
      { x: 0.3, y: 0.13, w: 0.42, h: 0.6, label: "Técnico INNOVA", conf: 99 },
      { x: 0.02, y: 0.32, w: 0.22, h: 0.44, label: "Rack Cat 6A · OK" },
    ],
  },
  {
    cam: "CAM-02",
    zone: "Acceso vehicular",
    src: "/img/puertas-instalacion.jpg",
    aspect: 1080 / 1045,
    boxes: [
      { x: 0.15, y: 0.3, w: 0.34, h: 0.68, label: "Persona", conf: 97 },
      { x: 0.68, y: 0.23, w: 0.3, h: 0.75, label: "Persona", conf: 95 },
    ],
  },
  {
    cam: "CAM-03",
    zone: "Parque solar",
    src: "/img/solar-campo.jpg",
    aspect: 910 / 1040,
    boxes: [
      { x: 0.45, y: 0.34, w: 0.24, h: 0.54, label: "Persona", conf: 98 },
      { x: 0.7, y: 0.31, w: 0.28, h: 0.64, label: "Persona", conf: 96 },
      { x: 0.0, y: 0.4, w: 0.42, h: 0.22, label: "Paneles · 5.2 kW" },
    ],
  },
  {
    cam: "CAM-04",
    zone: "Perímetro norte",
    src: "/img/cctv-poste.jpg",
    aspect: 620 / 1080,
    boxes: [
      { x: 0.62, y: 0.07, w: 0.33, h: 0.15, label: "PTZ · Online" },
      { x: 0.32, y: 0.54, w: 0.48, h: 0.24, label: "Iluminador IR" },
    ],
  },
  {
    cam: "CAM-05",
    zone: "Sala UPS",
    src: "/img/ups-tecnico.jpg",
    aspect: 950 / 900,
    boxes: [
      { x: 0.04, y: 0.12, w: 0.6, h: 0.86, label: "Persona", conf: 98 },
      { x: 0.66, y: 0.18, w: 0.33, h: 0.78, label: "UPS online · 100%" },
    ],
  },
];

const FEED_ASPECT = 4 / 3.4; // ancho / alto del visor
const CYCLE_MS = 6000;

/** Convierte coords de la imagen a coords del contenedor con object-cover */
function mapBox(b: Box, imgAspect: number): Box | null {
  let { x, y, w, h } = b;
  if (imgAspect > FEED_ASPECT) {
    const vis = FEED_ASPECT / imgAspect;
    const off = (1 - vis) / 2;
    x = (x - off) / vis;
    w = w / vis;
  } else {
    const vis = imgAspect / FEED_ASPECT;
    const off = (1 - vis) / 2;
    y = (y - off) / vis;
    h = h / vis;
  }
  const x0 = Math.max(0.02, x);
  const y0 = Math.max(0.06, y);
  const x1 = Math.min(0.98, x + w);
  const y1 = Math.min(0.96, y + h);
  if (x1 - x0 < 0.08 || y1 - y0 < 0.08) return null;
  return { ...b, x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  if (!now) return { date: "----/--/--", time: "--:--:--" };
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", ...o }).format(now);
  return { date: f({ year: "numeric", month: "2-digit", day: "2-digit" }), time: f({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) };
}

const HEADLINE = [
  { w: "Tecnología", c: "" },
  { w: "que", c: "" },
  { w: "protege,", c: "text-lime-400" },
  { w: "conecta", c: "" },
  { w: "y", c: "" },
  { w: "transforma.", c: "text-royal-300" },
];

export function HeroCCTV() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const clock = useClock();

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % FEEDS.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [active, paused]);

  // Inclinación 3D con el cursor
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 20 });

  const feed = FEEDS[active];

  return (
    <section
      className="relative isolate overflow-hidden bg-navy-950 pb-12 pt-24 sm:pb-16 sm:pt-36 lg:min-h-[100svh] lg:pb-10"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      {/* Fondo */}
      <div className="grid-bg absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_80%_70%_at_60%_40%,black,transparent)]" />
      <div className="absolute right-[-10%] top-[10%] -z-10 size-[720px] rounded-full bg-royal-500/30 blur-[140px]" />
      <div className="absolute bottom-[-20%] left-[-10%] -z-10 size-[520px] rounded-full bg-lime-400/10 blur-[140px]" />

      <div className="mx-auto grid max-w-7xl items-center px-4 sm:px-6 lg:grid-cols-[1.02fr_1fr] lg:gap-10">
        {/* Texto (en móvil sus hijos se reordenan alrededor del monitor) */}
        <div className="contents lg:relative lg:z-10 lg:block">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 inline-flex items-center gap-3 justify-self-start rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 backdrop-blur lg:order-none"
          >
            <span className="rounded-full bg-lime-400 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-navy-900">
              Armenia · Quindío
            </span>
            <span className="text-xs text-white/70"><span className="sm:hidden">Seguridad y sistemas</span><span className="hidden sm:inline">Seguridad y sistemas para hogares, empresas e industrias</span></span>
          </motion.div>

          <h1 className="order-2 mt-5 text-[2.75rem] sm:mt-7 lg:order-none font-bold leading-[0.95] tracking-[-0.035em] text-white sm:text-7xl xl:text-[5.4rem]">
            {HEADLINE.map((h, i) => (
              <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-top">
                <motion.span
                  className={`inline-block ${h.c}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  {h.w}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="order-4 mt-7 max-w-xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg lg:order-none"
          >
            Cámaras de seguridad, energía solar, automatización, domótica, redes y respaldo eléctrico.{" "}
            <span className="text-white">Un solo aliado</span> que diseña, instala y responde por todo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85 }}
            className="order-5 mt-7 grid gap-2.5 sm:mt-10 sm:flex sm:flex-wrap lg:order-none"
          >
            <Button href="/arma-tu-sistema" className="px-4 sm:px-6" icon={<ArrowRight className="size-3.5" />}>
              Arma tu sistema
            </Button>
            <Button
              href={waLink("Hola INNOVA 👋 Quiero una asesoría personalizada.")}
              external
              variant="ghost"
              className="px-4 sm:px-6"
              icon={<WhatsAppIcon className="size-3.5" />}
            >
              Asesoría gratis
            </Button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="order-6 mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:mt-12 sm:gap-6 lg:order-none"
          >
            {[
              ["7", "Soluciones integradas"],
              ["24/7", "Acceso remoto"],
              ["100%", "Garantía y postventa"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="text-2xl font-bold text-white sm:text-3xl">{n}</dt>
                <dd className="mt-1 text-xs leading-snug text-white/50">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Monitor VMS */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 1400 }}
          className="relative order-3 mt-8 lg:order-none lg:mt-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative overflow-hidden rounded-[1.6rem] border border-white/15 bg-navy-900/80 p-2 shadow-[0_40px_120px_-20px_rgba(6,96,216,0.55)] backdrop-blur-xl">
            {/* Barra superior */}
            <div className="flex items-center justify-between px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-white/15" />
                  <span className="size-2.5 rounded-full bg-white/15" />
                  <span className="size-2.5 rounded-full bg-lime-400" />
                </span>
                <span className="ml-2 hidden sm:inline">INNOVA VMS · En vivo</span>
              </div>
              <div className="flex items-center gap-3">
                <Wifi className="size-3.5 text-lime-400" />
                <span>{FEEDS.length} cámaras online</span>
              </div>
            </div>

            {/* Visor principal */}
            <div className="relative overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: FEED_ASPECT }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={feed.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
                  animate={{
                    opacity: 1,
                    clipPath: "inset(0 0 0% 0)",
                    filter: ["brightness(2.4) contrast(1.6) hue-rotate(40deg)", "brightness(1) contrast(1) hue-rotate(0deg)"],
                    x: [-14, 10, -5, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.06 }}
                    transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                  >
                    <Image
                      src={feed.src}
                      alt={`Vista en vivo ${feed.zone}`}
                      fill
                      priority={active === 0}
                      sizes="(max-width: 1024px) 100vw, 640px"
                      className="object-cover"
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Tratamiento de monitor */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.65))]" />
              <div className="scanlines pointer-events-none absolute inset-0 opacity-70" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />
              <div className="grain pointer-events-none absolute inset-0 overflow-hidden" />

              {/* Cajas de detección */}
              <AnimatePresence mode="popLayout">
                {feed.boxes.map((b0, i) => {
                  const b = mapBox(b0, feed.aspect);
                  if (!b) return null;
                  return (
                    <motion.div
                      key={feed.cam + i}
                      className="pointer-events-none absolute"
                      style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }}
                      initial={{ opacity: 0, scale: 1.25 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.12, delay: 0 } }}
                      transition={{ delay: 0.6 + i * 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <DetectionBox label={b.label} conf={b.conf} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* HUD */}
              <div className="pointer-events-none absolute inset-0 p-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white sm:p-4 sm:text-[11px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 rounded bg-black/45 px-2 py-1 backdrop-blur-sm">
                    <span className="size-2 animate-blink rounded-full bg-red-500" />
                    REC · {feed.cam}
                  </div>
                  <div className="rounded bg-black/45 px-2 py-1 text-right backdrop-blur-sm tabular-nums">
                    {clock.date} <span className="text-lime-400">{clock.time}</span>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between sm:bottom-4 sm:left-4 sm:right-4">
                  <div className="rounded bg-black/45 px-2 py-1 backdrop-blur-sm">{feed.zone}</div>
                  <div className="hidden rounded bg-black/45 px-2 py-1 backdrop-blur-sm sm:block">4K · 30FPS · H.265 · ☁ Nube</div>
                </div>
                {/* Mira central */}
                <svg className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-white/40" viewBox="0 0 40 40" aria-hidden>
                  <path d="M20 4v10M20 26v10M4 20h10M26 20h10" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
            </div>

            {/* Miniaturas */}
            <div className="mt-2 grid grid-cols-5 gap-1.5 sm:gap-2">
              {FEEDS.map((f, i) => (
                <button
                  key={f.cam}
                  onClick={() => setActive(i)}
                  className={`group relative aspect-[4/3] overflow-hidden rounded-lg ring-1 transition ${
                    i === active ? "ring-lime-400" : "ring-white/10 hover:ring-white/40"
                  }`}
                  aria-label={`Ver ${f.cam} ${f.zone}`}
                >
                  <Image src={f.src} alt="" fill sizes="120px" className={`object-cover transition ${i === active ? "" : "opacity-50 grayscale group-hover:opacity-80"}`} />
                  <span className="absolute left-1 top-1 font-mono text-[8px] text-white/90">{f.cam}</span>
                  {i === active && !paused && (
                    <motion.span
                      key={active}
                      className="absolute bottom-0 left-0 h-0.5 bg-lime-400"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tarjetas flotantes del ecosistema */}
          <FloatCard className="-left-10 top-[46%] hidden xl:flex" delay={1.4} icon={<Bell className="size-4" />} tone="lime" title="Movimiento detectado" sub="Parqueadero · 02:14 a. m." />
          <FloatCard className="-right-6 top-14 hidden lg:flex" delay={1.7} icon={<Sun className="size-4" />} tone="royal" title="Solar generando" sub="4.8 kW · ahorro hoy $38.400" />
          <FloatCard className="-left-8 top-[64%] hidden lg:flex" delay={2} icon={<DoorClosed className="size-4" />} tone="white" title="Portón principal" sub="Cerrado · Seguro activo" />
          <FloatCard className="-right-8 top-[58%] hidden xl:flex" delay={2.3} icon={<BatteryCharging className="size-4" />} tone="white" title="UPS en respaldo" sub="Autonomía 3 h 20 min" />
        </motion.div>
      </div>

      {/* Indicador de scroll */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
        <span className="h-10 w-px overflow-hidden bg-white/10">
          <motion.span
            className="block h-4 w-px bg-lime-400"
            animate={{ y: [-16, 40] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </div>
    </section>
  );
}

function DetectionBox({ label, conf }: { label: string; conf?: number }) {
  const c = "absolute size-3.5 border-lime-400";
  return (
    <div className="relative size-full">
      <div className="absolute inset-0 border border-lime-400/30 bg-lime-400/[0.04]" />
      <span className={`${c} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${c} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${c} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${c} bottom-0 right-0 border-b-2 border-r-2`} />
      <span className="absolute -top-5 left-0 whitespace-nowrap bg-lime-400 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-navy-900 sm:text-[10px]">
        {label}
        {conf ? ` · ${conf}%` : ""}
      </span>
    </div>
  );
}

function FloatCard({
  className,
  delay,
  icon,
  title,
  sub,
  tone,
}: {
  className: string;
  delay: number;
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone: "lime" | "royal" | "white";
}) {
  const toneCls = { lime: "bg-lime-400 text-navy-900", royal: "bg-royal-500 text-white", white: "bg-white text-navy-900" }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute z-10 ${className}`}
      style={{ transform: "translateZ(60px)" }}
    >
      <div className="flex animate-float items-center gap-3 rounded-2xl border border-white/10 bg-navy-900/85 p-2.5 pr-4 shadow-2xl shadow-black/40 backdrop-blur-xl" style={{ animationDelay: `${delay}s` }}>
        <span className={`grid size-9 place-items-center rounded-xl ${toneCls}`}>{icon}</span>
        <span>
          <span className="block text-sm font-semibold text-white">{title}</span>
          <span className="block font-mono text-[10px] text-white/55">{sub}</span>
        </span>
      </div>
    </motion.div>
  );
}
