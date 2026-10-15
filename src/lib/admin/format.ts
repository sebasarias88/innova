export const TIME_ZONE = "America/Bogota";

const copFormatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export function formatCop(value: number | null | undefined) {
  return value == null ? "A convenir" : copFormatter.format(value);
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: TIME_ZONE }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: TIME_ZONE }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { timeStyle: "short", timeZone: TIME_ZONE }).format(new Date(iso));
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
  let digits = digitsOnly(phone);
  if (digits.length === 10) digits = `57${digits}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
