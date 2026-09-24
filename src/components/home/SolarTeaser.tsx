"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight, Leaf, PanelsTopLeft, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { calcSolar, cop } from "@/lib/solar";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

export function SolarTeaser() {
  const [bill, setBill] = useState(450000);
  const r = useMemo(() => calcSolar(bill), [bill]);
  const pct = ((bill - 100000) / (3000000 - 100000)) * 100;

  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
          <Image src="/img/solar-campo.jpg" alt="Técnicos INNOVA en parque solar" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/30" />
          <div className="relative grid gap-12 p-6 sm:p-12 lg:grid-cols-2 lg:p-16">
            <div>
              <Eyebrow>Calculadora solar</Eyebrow>
              <h2 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-tight text-white sm:text-6xl">
                ¿Cuánto podrías <span className="text-lime-400">ahorrar</span> con el sol?
              </h2>
              <p className="mt-6 max-w-md text-pretty text-lg text-white/70">
                Mueve la barra con el valor de tu factura de energía y descubre al instante tu potencial de ahorro.
              </p>

              <div className="mt-10">
                <div className="flex items-end justify-between">
                  <label htmlFor="bill" className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
                    Tu factura mensual
                  </label>
                  <span className="text-3xl font-bold tabular-nums text-white">{cop(bill)}</span>
                </div>
                <input
                  id="bill"
                  type="range"
                  min={100000}
                  max={3000000}
                  step={10000}
                  value={bill}
                  onChange={(e) => setBill(+e.target.value)}
                  className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-lime-400 [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-navy-950 [&::-webkit-slider-thumb]:bg-lime-400"
                  style={{ background: `linear-gradient(to right, var(--color-lime-400) ${pct}%, rgb(255 255 255 / .1) ${pct}%)` }}
                />
                <div className="mt-2 flex justify-between font-mono text-[10px] text-white/40">
                  <span>$100.000</span>
                  <span>$3.000.000</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <div className="grid grid-cols-2 gap-3">
                <Metric icon={<Wallet className="size-5" />} label="Ahorro mensual estimado" value={cop(r.savingMonth)} highlight />
                <Metric icon={<Wallet className="size-5" />} label="Ahorro en 25 años" value={cop(r.saving25)} />
                <Metric icon={<PanelsTopLeft className="size-5" />} label="Paneles sugeridos" value={`${r.panels} · ${r.kwp.toFixed(1)} kWp`} />
                <Metric icon={<Leaf className="size-5" />} label="CO₂ evitado al año" value={`${Math.round(r.co2Year).toLocaleString("es-CO")} kg`} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button href="/calculadora-solar" icon={<ArrowRight className="size-3.5" />}>
                  Cálculo detallado
                </Button>
                <p className="max-w-[16rem] text-xs text-white/45">Estimación referencial. Un estudio técnico define el sistema exacto.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 backdrop-blur-xl ${highlight ? "bg-lime-400 text-navy-900" : "border border-white/10 bg-navy-900/70 text-white"}`}>
      <span className={highlight ? "text-navy-900" : "text-lime-400"}>{icon}</span>
      <motion.p key={value} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-lg font-bold tabular-nums tracking-tight sm:text-2xl">
        {value}
      </motion.p>
      <p className={`mt-1 text-xs ${highlight ? "text-navy-900/70" : "text-white/50"}`}>{label}</p>
    </div>
  );
}
