import { waUrl } from "@/lib/whatsapp";

export const TIME_ZONE = "America/Bogota";

const copFormatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export function formatCop(value: number | null | undefined) {
  return value == null ? "A convenir" : copFormatter.format(value);
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", hourCycle: "h12", timeZone: TIME_ZONE }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: TIME_ZONE }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit", hourCycle: "h12", timeZone: TIME_ZONE }).format(new Date(iso));
}

/** "14:00:00" (a DB time) → "2:00 p. m." — Colombia uses the 12-hour clock. */
export function formatClock(time: string | null | undefined) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const suffix = h < 12 ? "a. m." : "p. m.";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** 120 → "2 horas", 90 → "1 h 30 min". */
export function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  const hours = `${h} hora${h === 1 ? "" : "s"}`;
  return m ? `${h} h ${m} min` : hours;
}

/** "Cámaras IP 4K" → "camaras-ip-4k" (matches the DB slug check). */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

/** "57 321 853 9336" → "573218539336" */
export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function whatsappUrl(phone: string, text?: string) {
  return waUrl(digitsOnly(phone), text);
}

export const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
