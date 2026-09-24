"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { cities } from "@/lib/cities";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowUpRight } from "lucide-react";

export function Coverage() {
  const hub = cities.find((c) => c.hub)!;
  return (
    <section className="relative overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div>
          <Eyebrow>Cobertura</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-tight text-white sm:text-6xl">
            Desde Armenia para <span className="text-lime-400">todo Colombia.</span>
          </h2>
          <p className="mt-6 max-w-lg text-pretty text-lg text-white/65">
            Nacimos en el Quindío y llevamos nuestras soluciones a todo el Eje Cafetero y a cualquier ciudad donde esté tu proyecto.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-2 sm:mt-10">
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/cobertura/${c.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 sm:px-5 sm:py-4 transition-colors hover:border-lime-400/50 hover:bg-lime-400/5"
              >
                <span>
                  <span className="block font-semibold text-white">{c.name}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-white/45">{c.hub ? "Sede principal" : c.dept}</span>
                </span>
                <ArrowUpRight className="size-4 text-white/40 transition group-hover:rotate-45 group-hover:text-lime-400" />
              </Link>
            ))}
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[420px] lg:max-w-none">
          <div className="grid-bg absolute inset-0 rounded-[2rem] border border-white/10 [mask-image:radial-gradient(circle,black_55%,transparent_75%)]" />
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
            {/* radar */}
            {[12, 24, 36, 48].map((r) => (
              <circle key={r} cx={hub.x} cy={hub.y} r={r} fill="none" stroke="rgba(106,166,255,.15)" strokeWidth=".2" />
            ))}
            <g
              className="animate-[spin_8s_linear_infinite]"
              style={{ transformOrigin: `${hub.x}px ${hub.y}px`, transformBox: "view-box" }}
            >
              <path d={`M${hub.x} ${hub.y} L${hub.x} ${hub.y - 48} A48 48 0 0 1 ${hub.x + 34} ${hub.y - 34} Z`} fill="url(#sweep)" />
            </g>
            <defs>
              <linearGradient id="sweep" x1="0" x2="1">
                <stop offset="0" stopColor="#e9f205" stopOpacity="0" />
                <stop offset="1" stopColor="#e9f205" stopOpacity=".25" />
              </linearGradient>
            </defs>
            {cities.filter((c) => !c.hub).map((c, i) => (
              <motion.path
                key={c.slug}
                d={`M${hub.x} ${hub.y} Q${(hub.x + c.x) / 2 + 8} ${(hub.y + c.y) / 2 - 6} ${c.x} ${c.y}`}
                fill="none"
                stroke="#6aa6ff"
                strokeWidth=".35"
                strokeDasharray="1 1.2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: 0.3 + i * 0.15 }}
              />
            ))}
            {cities.map((c) => (
              <g key={c.slug}>
                <circle cx={c.x} cy={c.y} r={c.hub ? 2.2 : 1.2} fill={c.hub ? "#e9f205" : "#6aa6ff"} />
                {c.hub && (
                  <motion.circle cx={c.x} cy={c.y} fill="none" stroke="#e9f205" strokeWidth=".4" initial={{ r: 2, opacity: 1 }} animate={{ r: 9, opacity: 0 }} transition={{ duration: 2, repeat: Infinity }} />
                )}
                <text x={c.slug === "montenegro" || c.slug === "cali" ? c.x - 3 : c.x + 3} y={c.y + 1} textAnchor={c.slug === "montenegro" || c.slug === "cali" ? "end" : "start"} fontSize={c.hub ? 3.4 : 2.6} fill={c.hub ? "#fff" : "rgba(255,255,255,.7)"} fontWeight={c.hub ? 700 : 500}>
                  {c.name}
                </text>
              </g>
            ))}
          </svg>
          <div className="absolute bottom-6 left-6 rounded-xl border border-white/10 bg-navy-900/80 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur">
            <span className="text-lime-400">●</span> Sede · Cra 19A # 9-06 Armenia
          </div>
        </div>
      </div>
    </section>
  );
}
