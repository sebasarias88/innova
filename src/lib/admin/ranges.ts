/** Date ranges for reports, always in Colombia time (YYYY-MM-DD strings). */
export const RANGE_PRESETS = [
  { id: "today", label: "Hoy" },
  { id: "yesterday", label: "Ayer" },
  { id: "7d", label: "Últimos 7 días" },
  { id: "week", label: "Esta semana" },
  { id: "fortnight", label: "Esta quincena" },
  { id: "month", label: "Este mes" },
  { id: "last_month", label: "Mes anterior" },
  { id: "30d", label: "Últimos 30 días" },
  { id: "year", label: "Este año" },
] as const;

export type RangePreset = (typeof RANGE_PRESETS)[number]["id"] | "custom";
export type DateRange = { preset: RangePreset; from: string; to: string; label: string; group: "day" | "week" | "month"; days: number };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function bogotaToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
}

const toDate = (iso: string) => new Date(`${iso}T12:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
};
const diffDays = (from: string, to: string) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / 86_400_000);

export function formatDay(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("es-CO", { timeZone: "UTC", ...opts }).format(toDate(iso));
}

function presetRange(preset: Exclude<RangePreset, "custom">, today: string): [string, string] {
  const d = toDate(today);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const monthStart = toIso(new Date(Date.UTC(y, m, 1, 12)));
  switch (preset) {
    case "today":
      return [today, today];
    case "yesterday":
      return [addDays(today, -1), addDays(today, -1)];
    case "7d":
      return [addDays(today, -6), today];
    case "30d":
      return [addDays(today, -29), today];
    case "week": {
      const weekday = (d.getUTCDay() + 6) % 7; // Monday = 0
      return [addDays(today, -weekday), today];
    }
    case "fortnight":
      return d.getUTCDate() <= 15 ? [monthStart, today] : [toIso(new Date(Date.UTC(y, m, 16, 12))), today];
    case "month":
      return [monthStart, today];
    case "last_month":
      return [toIso(new Date(Date.UTC(y, m - 1, 1, 12))), toIso(new Date(Date.UTC(y, m, 0, 12)))];
    case "year":
      return [toIso(new Date(Date.UTC(y, 0, 1, 12))), today];
  }
}

/** Reads ?preset=…&from=…&to=… (custom dates are validated and capped to ~4 years). */
export function resolveRange(sp: { preset?: string; from?: string; to?: string }, fallback: Exclude<RangePreset, "custom"> = "month"): DateRange {
  const today = bogotaToday();
  let preset: RangePreset = fallback;
  let from: string;
  let to: string;
  if (sp.preset === "custom" && sp.from && sp.to && ISO.test(sp.from) && ISO.test(sp.to)) {
    preset = "custom";
    [from, to] = sp.from <= sp.to ? [sp.from, sp.to] : [sp.to, sp.from];
    if (to > today) to = today;
    if (from > to) from = to;
    if (diffDays(from, to) > 1460) from = addDays(to, -1460);
  } else {
    const known = RANGE_PRESETS.find((p) => p.id === sp.preset);
    preset = known?.id ?? fallback;
    [from, to] = presetRange(preset, today);
  }
  const days = diffDays(from, to) + 1;
  const label =
    preset === "custom"
      ? from === to
        ? formatDay(from)
        : `${formatDay(from)} – ${formatDay(to)}`
      : (RANGE_PRESETS.find((p) => p.id === preset)?.label ?? "");
  return { preset, from, to, label, days, group: days <= 45 ? "day" : days <= 200 ? "week" : "month" };
}
