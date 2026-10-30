"use client";

import { useState, useTransition } from "react";
import { BusyContent } from "@/components/ui/Busy";
import { usePathname, useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";
import clsx from "clsx";
import { RANGE_PRESETS, type DateRange } from "@/lib/admin/ranges";

/** Quick ranges (hoy, semana, quincena, mes…) plus a custom from–to. */
export function RangePicker({ range, today }: { range: DateRange; today: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  const [custom, setCustom] = useState(range.preset === "custom");

  // The chip that was tapped shows a spinner until the new numbers arrive.
  const [pending, start] = useTransition();
  const [target, setTarget] = useState<string | null>(null);
  const go = (key: string, params: Record<string, string>) => {
    setTarget(key);
    start(() => router.push(`${pathname}?${new URLSearchParams(params)}`, { scroll: false }));
  };
  const busy = (key: string) => pending && target === key;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={pending}
            aria-busy={busy(p.id)}
            onClick={() => {
              setCustom(false);
              go(p.id, { preset: p.id });
            }}
            className={clsx(
              "relative shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-wait",
              range.preset === p.id && !custom ? "border-lime-400 bg-lime-400 text-navy-900" : "border-white/15 text-white/70 hover:border-white/40 hover:text-white",
            )}
          >
            <BusyContent busy={busy(p.id)} spinnerClassName="size-3.5">
              {p.label}
            </BusyContent>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCustom(true)}
          className={clsx(
            "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            custom ? "border-lime-400 bg-lime-400 text-navy-900" : "border-white/15 text-white/70 hover:border-white/40 hover:text-white",
          )}
        >
          <CalendarRange className="size-3.5" /> Personalizado
        </button>
      </div>
      {custom && (
        <form
          className="mt-3 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            go("custom", { preset: "custom", from, to });
          }}
        >
          <label className="text-xs font-semibold text-white/60">
            Desde
            <input type="date" value={from} max={today} required onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded-lg border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white [color-scheme:dark]" />
          </label>
          <label className="text-xs font-semibold text-white/60">
            Hasta
            <input type="date" value={to} max={today} required onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded-lg border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white [color-scheme:dark]" />
          </label>
          <button
            type="submit"
            disabled={pending}
            aria-busy={busy("custom")}
            className="relative rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-white disabled:cursor-wait"
          >
            <BusyContent busy={busy("custom")}>Ver</BusyContent>
          </button>
        </form>
      )}
    </div>
  );
}
