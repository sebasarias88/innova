import type { ReactNode } from "react";
import clsx from "clsx";

/** Big number with a label (reports and analytics). */
export function Kpi({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean }) {
  return (
    <div className={clsx("rounded-2xl border p-4 sm:p-5", accent ? "border-lime-400/30 bg-lime-400/[0.06]" : "border-white/10 bg-white/[0.03]")}>
      <p className="text-xs font-semibold text-white/55">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight sm:text-[28px]">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
    </div>
  );
}

/**
 * Vertical bars over time, drawn with plain HTML (no chart library).
 * Each bar shows its exact value on hover/focus.
 */
export function BarSeries({ data, format = (n) => String(n), empty = "Sin datos en este rango." }: { data: { label: string; value: number; title?: string }[]; format?: (n: number) => string; empty?: string }) {
  const max = Math.max(0, ...data.map((d) => d.value));
  if (!data.length || max === 0) return <p className="py-10 text-center text-sm text-white/45">{empty}</p>;
  const step = Math.max(1, Math.ceil(data.length / 10)); // at most ~10 axis labels
  return (
    <div>
      <div className="flex h-44 items-end gap-[3px] sm:gap-1" role="list">
        {data.map((d) => (
          <div key={d.label} role="listitem" className="group relative flex h-full min-w-0 flex-1 items-end" tabIndex={0} aria-label={`${d.title ?? d.label}: ${format(d.value)}`}>
            <div className="w-full rounded-t-[4px] bg-lime-400/80 transition-colors group-hover:bg-lime-300 group-focus:bg-lime-300" style={{ height: `${Math.max(d.value > 0 ? 2 : 0, (d.value / max) * 100)}%` }} />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-navy-900 shadow-lg group-hover:block group-focus:block">
              {d.title ?? d.label}: {format(d.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[3px] sm:gap-1">
        {data.map((d, i) => (
          <span key={d.label} className="min-w-0 flex-1 truncate text-center text-[10px] text-white/40">
            {i % step === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Ranked list with proportional bars (top products, sources, cities…). */
export function RankList({ items, format = (n) => String(n), empty = "Sin datos." }: { items: { label: ReactNode; value: number; sub?: ReactNode; key?: string }[]; format?: (n: number) => string; empty?: string }) {
  const max = Math.max(0, ...items.map((i) => i.value));
  if (!items.length) return <p className="py-4 text-sm text-white/45">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={item.key ?? i}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-white/85">{item.label}</span>
            <span className="shrink-0 font-mono text-xs text-white">
              {format(item.value)}
              {item.sub && <span className="ml-1.5 text-white/40">{item.sub}</span>}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-lime-400/70" style={{ width: `${max ? Math.max(2, (item.value / max) * 100) : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
