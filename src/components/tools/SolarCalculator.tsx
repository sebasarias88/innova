"use client";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { BatteryCharging, CalendarClock, Leaf, PanelsTopLeft, PiggyBank, Ruler, TreePine, Zap } from "lucide-react";
import clsx from "clsx";
import { calcSolar, cop, SOLAR, type SolarType } from "@/lib/solar";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { waLink } from "@/lib/site";

const TYPES: { id: SolarType; label: string; hint: string }[] = [
  { id: "on-grid", label: "On-grid", hint: "Conectado a la red · mayor ahorro" },
  { id: "hibrido", label: "Híbrido", hint: "Ahorro + baterías ante cortes" },
  { id: "off-grid", label: "Off-grid", hint: "Independiente, sin red" },
];

// Variación mensual aproximada de radiación (Eje Cafetero)
const SEASON = [1.04, 1.06, 1.03, 0.95, 0.93, 1.0, 1.08, 1.07, 1.01, 0.92, 0.9, 0.97];
const MONTHS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function SolarCalculator() {
  const [bill, setBill] = useState(600000);
  const [tariff, setTariff] = useState(SOLAR.defaultTariff);
  const [coverage, setCoverage] = useState(90);
  const [type, setType] = useState<SolarType>("hibrido");

  const r = useMemo(() => calcSolar(bill, tariff, coverage / 100, type), [bill, tariff, coverage, type]);
  const maxBar = Math.max(r.kwhMonth, r.genMonth * 1.1);

  const msg = [
    "Hola INNOVA ☀️ Hice el cálculo solar en la web:",
    `• Factura: ${cop(bill)}/mes (${Math.round(r.kwhMonth)} kWh)`,
    `• Sistema ${type}: ${r.kwp.toFixed(1)} kWp · ${r.panels} paneles`,
    `• Ahorro estimado: ${cop(r.savingMonth)}/mes`,
    "Quiero agendar el estudio técnico.",
  ].join("\n");

  return (
    <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[400px_1fr]">
      {/* Controles */}
      <div className="space-y-6 rounded-[2rem] border border-white/10 bg-navy-900/60 p-6 backdrop-blur-xl sm:p-8 lg:sticky lg:top-28 lg:self-start">
        <div>
          <div className="flex items-baseline justify-between">
            <Label>Factura mensual</Label>
            <span className="text-2xl font-bold tabular-nums text-white">{cop(bill)}</span>
          </div>
          <input type="range" min={100000} max={8000000} step={10000} value={bill} onChange={(e) => setBill(+e.target.value)} className="mt-4 w-full accent-lime-400" />
        </div>

        <div>
          <Label>Tipo de sistema</Label>
          <div className="mt-3 grid gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={clsx("flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors", type === t.id ? "border-lime-400 bg-lime-400/10" : "border-white/10 hover:border-white/30")}
              >
                <span>
                  <span className={clsx("block font-semibold", type === t.id ? "text-lime-400" : "text-white")}>{t.label}</span>
                  <span className="block text-xs text-white/50">{t.hint}</span>
                </span>
                <span className={clsx("size-4 rounded-full border-2", type === t.id ? "border-lime-400 bg-lime-400" : "border-white/30")} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <Label>Cobertura deseada</Label>
            <span className="font-semibold tabular-nums text-white">{coverage}%</span>
          </div>
          <input type="range" min={40} max={100} step={5} value={coverage} onChange={(e) => setCoverage(+e.target.value)} className="mt-4 w-full accent-lime-400" />
        </div>

        <div>
          <Label>Tarifa de energía (COP/kWh)</Label>
          <input
            type="number"
            value={tariff}
            onChange={(e) => setTariff(Math.max(200, +e.target.value || 0))}
            className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-white focus:border-lime-400 focus:outline-none"
          />
          <p className="mt-2 text-xs text-white/40">Encuéntrala en tu factura (valor del kWh).</p>
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-lime-400 p-7 text-navy-900 sm:p-10">
          <div className="grid-bg-light absolute inset-0 opacity-60" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em]">Ahorro mensual estimado</p>
              <motion.p key={Math.round(r.savingMonth / 1000)} initial={{ opacity: 0.5, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-5xl font-bold tracking-tighter tabular-nums sm:text-7xl">
                {cop(r.savingMonth)}
              </motion.p>
              <p className="mt-2 text-navy-900/70">≈ {cop(r.savingMonth * 12)} al año · {cop(r.saving25)} en 25 años</p>
            </div>
            <a
              href={waLink(msg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-lime-400 transition-colors hover:bg-royal-500 hover:text-white"
            >
              <WhatsAppIcon className="size-4" /> Agendar estudio gratis
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={<Zap className="size-5" />} label="Potencia" value={`${r.kwp.toFixed(1)} kWp`} />
          <Stat icon={<PanelsTopLeft className="size-5" />} label="Paneles 585 W" value={`${r.panels}`} />
          <Stat icon={<Ruler className="size-5" />} label="Área de techo" value={`${Math.round(r.area)} m²`} />
          <Stat icon={<BatteryCharging className="size-5" />} label="Generación" value={`${Math.round(r.genMonth)} kWh/mes`} />
          <Stat icon={<PiggyBank className="size-5" />} label="Inversión referencial" value={cop(r.investment)} />
          <Stat icon={<CalendarClock className="size-5" />} label="Retorno" value={`${r.paybackYears.toFixed(1)} años`} />
          <Stat icon={<Leaf className="size-5" />} label="CO₂ evitado/año" value={`${Math.round(r.co2Year).toLocaleString("es-CO")} kg`} />
          <Stat icon={<TreePine className="size-5" />} label="Equivale a" value={`${Math.round(r.trees)} árboles`} />
        </div>

        {/* Paneles visuales */}
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">Tu techo solar</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {Array.from({ length: Math.min(r.panels, 80) }, (_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.015 }}
                className="h-10 w-7 rounded-[3px] border border-royal-300/50 bg-gradient-to-br from-royal-400 to-navy-700 [background-size:100%_100%] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                style={{ backgroundImage: "linear-gradient(135deg,#2f7ff0,#042874), repeating-linear-gradient(90deg,transparent 0 6px,rgba(255,255,255,.12) 6px 7px)" }}
              />
            ))}
            {r.panels > 80 && <span className="self-center pl-2 font-mono text-sm text-white/60">+{r.panels - 80}</span>}
          </div>
        </div>

        {/* Gráfica */}
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">Consumo vs. generación mensual</p>
            <div className="flex gap-4 text-xs text-white/60">
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-white/25" /> Consumo</span>
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-lime-400" /> Generación solar</span>
            </div>
          </div>
          <div className="mt-6 flex h-52 items-end gap-2 sm:gap-3">
            {SEASON.map((f, i) => {
              const gen = r.genMonth * f;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-44 w-full items-end justify-center gap-0.5">
                    <motion.div className="w-1/2 rounded-t bg-white/20" initial={{ height: 0 }} animate={{ height: `${(r.kwhMonth / maxBar) * 100}%` }} transition={{ type: "spring", bounce: 0.15 }} />
                    <motion.div className="w-1/2 rounded-t bg-lime-400" initial={{ height: 0 }} animate={{ height: `${(gen / maxBar) * 100}%` }} transition={{ type: "spring", bounce: 0.15, delay: i * 0.02 }} />
                  </div>
                  <span className="font-mono text-[10px] text-white/40">{MONTHS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-white/40">
          * Estimación referencial basada en {SOLAR.hsp} horas sol pico promedio para el Eje Cafetero, paneles de {SOLAR.panelW} W y eficiencia del
          sistema del {SOLAR.pr * 100}%. Los valores de inversión y ahorro son aproximados; el diseño final se define con un estudio técnico en sitio.
        </p>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">{children}</p>;
}
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <span className="text-lime-400">{icon}</span>
      <p className="mt-4 text-lg font-bold tabular-nums tracking-tight text-white sm:text-xl">{value}</p>
      <p className="mt-0.5 text-xs text-white/50">{label}</p>
    </div>
  );
}
