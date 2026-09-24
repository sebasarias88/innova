import { stats } from "@/lib/site";
import { CountUp } from "@/components/ui/CountUp";
import { Marquee } from "@/components/ui/Marquee";

export function Stats() {
  return (
    <section className="relative overflow-hidden bg-lime-400 text-navy-900">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-navy-900/10 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-lime-400 px-4 py-12 sm:px-8 sm:py-16">
            <CountUp to={s.value} suffix={s.suffix} className="block text-5xl font-bold tracking-tighter tabular-nums sm:text-7xl" />
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-navy-900/70">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-navy-900/15 bg-navy-900 py-4 font-mono text-sm uppercase tracking-[0.2em] text-lime-400">
        <Marquee items={["CCTV", "Energía solar", "Automatización de puertas", "Domótica", "Cableado estructurado", "Sistemas UPS", "Servicios informáticos"]} />
      </div>
    </section>
  );
}
