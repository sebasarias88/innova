"use client";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, RotateCcw, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { HudCorners } from "@/components/ui/HudCorners";
import { waLink } from "@/lib/site";
import { calcSolar, cop } from "@/lib/solar";

/* ───────── Datos ───────── */
const SPACES = [
  { id: "casa", label: "Casa", icon: "Home", group: "hogar" },
  { id: "apto", label: "Apartamento", icon: "Building", group: "hogar" },
  { id: "finca", label: "Finca", icon: "Trees", group: "hogar" },
  { id: "local", label: "Negocio / Local", icon: "Store", group: "empresa" },
  { id: "oficina", label: "Oficina", icon: "Building2", group: "empresa" },
  { id: "conjunto", label: "Conjunto residencial", icon: "Hotel", group: "empresa" },
  { id: "bodega", label: "Bodega / Industria", icon: "Factory", group: "industria" },
] as const;

const GOALS = [
  { id: "cctv", label: "Vigilar con cámaras", icon: "Cctv" },
  { id: "puertas", label: "Automatizar puertas", icon: "DoorOpen" },
  { id: "solar", label: "Ahorrar energía con solar", icon: "Sun" },
  { id: "domotica", label: "Espacio inteligente", icon: "HousePlug" },
  { id: "red", label: "Red / internet estable", icon: "Cable" },
  { id: "ups", label: "Respaldo ante cortes", icon: "BatteryCharging" },
  { id: "it", label: "Soporte de equipos", icon: "Laptop" },
] as const;

const SIZES = [
  { id: "s", label: "Pequeño", hint: "< 100 m²" },
  { id: "m", label: "Mediano", hint: "100 – 300 m²" },
  { id: "l", label: "Grande", hint: "300 – 1.000 m²" },
  { id: "xl", label: "Muy grande", hint: "> 1.000 m²" },
] as const;

const TIERS = [
  { id: "esencial", label: "Esencial", hint: "Mejor precio" },
  { id: "pro", label: "Pro", hint: "Equilibrio ideal" },
  { id: "elite", label: "Élite", hint: "Máxima calidad" },
] as const;

type SpaceId = (typeof SPACES)[number]["id"];
type GoalId = (typeof GOALS)[number]["id"];
type SizeId = (typeof SIZES)[number]["id"];
type TierId = (typeof TIERS)[number]["id"];

type Item = { service: string; icon: string; title: string; lines: string[] };

const pow2 = (n: number) => [4, 8, 16, 32, 64].find((c) => c >= n) ?? 64;

function buildSystem(space: SpaceId, goals: GoalId[], size: SizeId, entrances: number, tier: TierId, bill: number): Item[] {
  const k = { s: 0, m: 1, l: 2, xl: 3 }[size];
  const industrial = space === "bodega";
  const business = ["local", "oficina", "conjunto", "bodega"].includes(space);
  const items: Item[] = [];

  if (goals.includes("cctv")) {
    const cams = [4, 8, 16, 32][k] + entrances;
    const res = tier === "esencial" ? "2 MP (1080p)" : tier === "pro" ? "4 MP con IA" : "4K (8 MP) con IA y color nocturno";
    items.push({
      service: "CCTV",
      icon: "Cctv",
      title: `${cams} cámaras IP ${res}`,
      lines: [
        `NVR de ${pow2(cams)} canales con disco de ${Math.max(1, Math.ceil(cams * 0.45))} TB (≈ 30 días)`,
        tier === "esencial" ? "App móvil y acceso remoto" : "Detección de personas y vehículos + alertas al celular",
        tier === "elite" ? "Respaldo de eventos en la nube" : "Opción de almacenamiento en la nube",
      ],
    });
  }
  if (goals.includes("puertas")) {
    const type = industrial ? "seccionales / enrollables industriales" : space === "conjunto" ? "corredizas de alto tráfico" : "corredizas o batientes";
    items.push({
      service: "Puertas",
      icon: "DoorOpen",
      title: `${Math.max(1, entrances)} ${entrances > 1 ? "puertas" : "puerta"} ${type}`,
      lines: ["Motor, fotoceldas y sensores de seguridad", tier === "esencial" ? "2 controles remotos por puerta" : "Apertura desde el celular", "Instalación, programación y garantía"],
    });
  }
  if (goals.includes("solar")) {
    const r = calcSolar(bill, undefined, 0.9, tier === "esencial" ? "on-grid" : "hibrido");
    items.push({
      service: "Solar",
      icon: "Sun",
      title: `Sistema ${tier === "esencial" ? "on-grid" : "híbrido"} de ${r.kwp.toFixed(1)} kWp`,
      lines: [`${r.panels} paneles de 585 W · ≈ ${Math.round(r.area)} m² de techo`, `Ahorro estimado ${cop(r.savingMonth)}/mes`, tier === "esencial" ? "Inversor conectado a red" : "Inversor híbrido + baterías de litio"],
    });
  }
  if (goals.includes("domotica")) {
    const pts = [6, 12, 24, 40][k];
    items.push({
      service: "Domótica",
      icon: "HousePlug",
      title: `${pts} puntos inteligentes`,
      lines: ["Iluminación y escenas automáticas", tier === "esencial" ? "Control por app" : "Control por app y voz (Alexa / Google)", business ? "Climatización y horarios de oficina" : "Cerradura inteligente y sensores"],
    });
  }
  if (goals.includes("red")) {
    const pts = [6, 16, 48, 120][k];
    items.push({
      service: "Red",
      icon: "Cable",
      title: `${pts} puntos de red ${tier === "elite" ? "Cat 6A" : "Cat 6"}`,
      lines: [`Rack de ${k < 2 ? "9" : "42"} U con patch panel y organizadores`, "Certificación y pruebas de cada punto", k > 0 ? "Wi-Fi empresarial de cobertura total" : "Router y Wi-Fi optimizado"],
    });
  }
  if (goals.includes("ups")) {
    const kva = [1, 3, 6, 10][k];
    const online = tier !== "esencial" || business;
    items.push({
      service: "UPS",
      icon: "BatteryCharging",
      title: `UPS ${online ? "online" : "interactiva"} de ${kva} kVA`,
      lines: [online ? "Energía regulada para equipos críticos" : "Protección para equipos generales", `Autonomía estimada ${tier === "elite" ? "2 h con banco extendido" : "20 – 40 min"}`, "Instalación y diagnóstico"],
    });
  }
  if (goals.includes("it")) {
    items.push({
      service: "Informática",
      icon: "Laptop",
      title: business ? "Plan de soporte empresarial" : "Soporte técnico para el hogar",
      lines: ["Mantenimiento preventivo programado", "Antivirus y software licenciado", "Reparación y upgrades de hardware"],
    });
  }
  return items;
}

/* ───────── Componente ───────── */
const STEPS = ["Espacio", "Objetivos", "Detalles", "Tu sistema"];

export function SystemBuilder() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [space, setSpace] = useState<SpaceId | null>(() => {
    const t = params.get("tipo");
    return t === "hogar" ? "casa" : t === "empresa" ? "local" : t === "industria" ? "bodega" : null;
  });
  const [goals, setGoals] = useState<GoalId[]>(() => {
    const s = params.get("servicio");
    return GOALS.filter((g) => g.id === s).map((g) => g.id);
  });
  const [size, setSize] = useState<SizeId>("m");
  const [entrances, setEntrances] = useState(1);
  const [tier, setTier] = useState<TierId>("pro");
  const [bill, setBill] = useState(450000);
  const [name, setName] = useState("");
  const [city, setCity] = useState("Armenia");
  const [thinking, setThinking] = useState(false);


  const items = useMemo(() => (space ? buildSystem(space, goals, size, entrances, tier, bill) : []), [space, goals, size, entrances, tier, bill]);
  const score = Math.min(100, 35 + goals.length * 9 + { esencial: 0, pro: 8, elite: 15 }[tier]);

  const canNext = step === 0 ? !!space : step === 1 ? goals.length > 0 : true;
  const next = () => {
    if (step === 2) {
      setThinking(true);
      setTimeout(() => setThinking(false), 1800);
    }
    setStep((s) => Math.min(3, s + 1));
  };
  const reset = () => {
    setStep(0);
    setGoals([]);
    setSpace(null);
  };

  const message = () => {
    const sp = SPACES.find((s) => s.id === space)?.label;
    const sz = SIZES.find((s) => s.id === size);
    return [
      `Hola INNOVA 👋 Armé mi sistema en la web y quiero una cotización.`,
      ``,
      `👤 ${name || "(sin nombre)"} · 📍 ${city}`,
      `🏠 Espacio: ${sp} · ${sz?.label} (${sz?.hint}) · ${entrances} acceso(s)`,
      `⭐ Nivel: ${TIERS.find((t) => t.id === tier)?.label}`,
      ``,
      ...items.map((i) => `• ${i.service}: ${i.title}`),
    ].join("\n");
  };

  return (
    <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[260px_1fr]">
      {/* Progreso */}
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:flex-col [&::-webkit-scrollbar]:hidden">
          {STEPS.map((s, i) => (
            <li key={s} className="shrink-0">
              <button
                disabled={i > step}
                onClick={() => i < step && setStep(i)}
                className={clsx(
                  "flex w-full items-center gap-2.5 whitespace-nowrap rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors sm:gap-3 sm:px-4 sm:py-3",
                  i === step ? "border-lime-400/60 bg-lime-400/10 text-white" : i < step ? "border-white/10 text-white/80 hover:border-white/30" : "border-white/5 text-white/35",
                )}
              >
                <span
                  className={clsx(
                    "grid size-7 place-items-center rounded-full font-mono text-[11px]",
                    i < step ? "bg-lime-400 text-navy-900" : i === step ? "bg-white text-navy-900" : "bg-white/10",
                  )}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                {s}
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-6 hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Nivel de protección</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-bold tabular-nums text-white">{step > 0 ? score : 0}</span>
            <span className="pb-1 text-white/40">/100</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-royal-500 to-lime-400" animate={{ width: `${step > 0 ? score : 0}%` }} transition={{ type: "spring", bounce: 0.2 }} />
          </div>
        </div>
      </aside>

      {/* Panel */}
      <div className="relative min-h-[520px] min-w-0 overflow-hidden rounded-[1.6rem] border border-white/10 bg-navy-900/60 p-4 backdrop-blur-xl sm:min-h-[560px] sm:rounded-[2rem] sm:p-10">
        <HudCorners className="m-4 text-white/15" />
        <AnimatePresence mode="wait">
          <motion.div
            key={step + (thinking ? "t" : "")}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
          >
            {step === 0 && (
              <>
                <StepTitle n="01" title="¿Qué espacio quieres proteger?" text="Elige el tipo de inmueble para adaptar la recomendación." />
                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                  {SPACES.map((s) => (
                    <OptionCard key={s.id} active={space === s.id} onClick={() => setSpace(s.id)} icon={s.icon} label={s.label} />
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <StepTitle n="02" title="¿Qué quieres lograr?" text="Puedes elegir varias opciones. Así diseñamos un sistema integrado." />
                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                  {GOALS.map((g) => (
                    <OptionCard
                      key={g.id}
                      multi
                      active={goals.includes(g.id)}
                      onClick={() => setGoals((gs) => (gs.includes(g.id) ? gs.filter((x) => x !== g.id) : [...gs, g.id]))}
                      icon={g.icon}
                      label={g.label}
                    />
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <StepTitle n="03" title="Cuéntanos un poco más" text="Con estos datos calculamos cantidades y equipos." />
                <div className="mt-8 space-y-8">
                  <Field label="Tamaño aproximado">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {SIZES.map((s) => (
                        <Pill key={s.id} active={size === s.id} onClick={() => setSize(s.id)} label={s.label} hint={s.hint} />
                      ))}
                    </div>
                  </Field>
                  <Field label="Accesos / entradas">
                    <div className="inline-flex items-center gap-4 rounded-full border border-white/15 p-1.5">
                      <button onClick={() => setEntrances((e) => Math.max(1, e - 1))} className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Menos">
                        <Minus className="size-4" />
                      </button>
                      <span className="w-8 text-center text-2xl font-bold tabular-nums text-white">{entrances}</span>
                      <button onClick={() => setEntrances((e) => Math.min(12, e + 1))} className="grid size-10 place-items-center rounded-full bg-lime-400 text-navy-900 hover:bg-white" aria-label="Más">
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </Field>
                  <Field label="Nivel de equipos">
                    <div className="grid grid-cols-3 gap-2">
                      {TIERS.map((t) => (
                        <Pill key={t.id} active={tier === t.id} onClick={() => setTier(t.id)} label={t.label} hint={t.hint} />
                      ))}
                    </div>
                  </Field>
                  {goals.includes("solar") && (
                    <Field label={`Factura de energía mensual · ${cop(bill)}`}>
                      <input
                        type="range"
                        min={100000}
                        max={5000000}
                        step={10000}
                        value={bill}
                        onChange={(e) => setBill(+e.target.value)}
                        className="w-full accent-lime-400"
                      />
                    </Field>
                  )}
                </div>
              </>
            )}

            {step === 3 && thinking && (
              <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
                <div className="relative size-28">
                  <motion.span className="absolute inset-0 rounded-full border-2 border-lime-400/20 border-t-lime-400" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                  <ShieldCheck className="absolute inset-0 m-auto size-10 text-lime-400" />
                </div>
                <p className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-lime-400">Diseñando tu sistema</p>
                <p className="mt-2 text-white/60">Calculando equipos, cantidades y cobertura…</p>
              </div>
            )}

            {step === 3 && !thinking && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <StepTitle n="04" title="Tu sistema INNOVA recomendado" text="Una propuesta preliminar. Un técnico la valida en la visita de diagnóstico sin costo." />
                  <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white">
                    <RotateCcw className="size-4" /> Empezar de nuevo
                  </button>
                </div>
                <div className="mt-8 grid gap-3 md:grid-cols-2">
                  {items.map((it, i) => (
                    <motion.div
                      key={it.service}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-lime-400 text-navy-900">
                          <Icon name={it.icon} className="size-5" />
                        </span>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime-400">{it.service}</p>
                          <p className="font-semibold leading-tight text-white">{it.title}</p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-1.5">
                        {it.lines.map((l) => (
                          <li key={l} className="flex gap-2 text-sm text-white/65">
                            <Check className="mt-0.5 size-4 shrink-0 text-royal-300" /> {l}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 rounded-2xl bg-royal-500 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6">
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Tu nombre</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Laura Gómez" className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:border-lime-400 focus:outline-none" />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Ciudad</span>
                    <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                  </label>
                  <a
                    href={waLink(message())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 py-3.5 font-semibold text-navy-900 transition-colors hover:bg-white"
                  >
                    <WhatsAppIcon className="size-5" /> Enviar a un asesor
                  </a>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {step < 3 && (
          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={clsx("inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white", step === 0 && "invisible")}
            >
              <ArrowLeft className="size-4" /> Atrás
            </button>
            <button
              disabled={!canNext}
              onClick={next}
              className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-navy-900 transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              {step === 2 ? "Ver mi sistema" : "Continuar"} <ArrowRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepTitle({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lime-400">Paso {n}</p>
      <h2 className="mt-2 text-balance text-2xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-2 text-white/55">{text}</p>
    </div>
  );
}

function OptionCard({ active, onClick, icon, label, multi }: { active: boolean; onClick: () => void; icon: string; label: string; multi?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group relative flex h-28 flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-300 sm:aspect-[1.15] sm:h-auto sm:p-4",
        active ? "border-lime-400 bg-lime-400 text-navy-900" : "border-white/10 bg-white/[0.03] text-white hover:-translate-y-0.5 hover:border-white/30",
      )}
    >
      <Icon name={icon} className="size-6 sm:size-7" />
      <span className="text-sm font-semibold leading-tight sm:text-base">{label}</span>
      <span
        className={clsx(
          "absolute right-3 top-3 grid size-5 place-items-center border transition-colors",
          multi ? "rounded-md" : "rounded-full",
          active ? "border-navy-900 bg-navy-900 text-lime-400" : "border-white/30",
        )}
      >
        {active && <Check className="size-3" />}
      </span>
    </button>
  );
}

function Pill({ active, onClick, label, hint }: { active: boolean; onClick: () => void; label: string; hint: string }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-2xl border px-4 py-3 text-left transition-colors",
        active ? "border-lime-400 bg-lime-400/10" : "border-white/10 hover:border-white/30",
      )}
    >
      <span className={clsx("block font-semibold", active ? "text-lime-400" : "text-white")}>{label}</span>
      <span className="block text-xs text-white/50">{hint}</span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">{label}</p>
      {children}
    </div>
  );
}
