"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailableSlots, type Slot } from "@/lib/bookings/slots";
import { getService, services } from "@/lib/services";
import { getSiteSettings } from "@/lib/shop/queries";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { site } from "@/lib/site";
import { legal } from "@/lib/legal";
import { after } from "next/server";
import { notifyNewBooking } from "@/lib/notifications";

z.config(z.locales.es());

export async function refreshSlots(): Promise<Slot[]> {
  return getAvailableSlots();
}

const phone = z
  .string()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .refine((v) => /^\+?[0-9]{7,15}$/.test(v), "Escribe un celular válido, por ejemplo 300 123 4567.");

const schema = z.object({
  service: z.enum(services.map((s) => s.slug) as [string, ...string[]], "Elige el servicio."),
  startsAt: z.iso.datetime({ offset: true, message: "Elige una fecha y hora." }),
  customer: z.object({
    name: z.string().trim().min(3, "Escribe tu nombre completo.").max(120),
    phone,
    email: z.union([z.literal(""), z.email("Correo no válido.").max(160)]).optional(),
    city: z.string().trim().min(2, "Escribe tu ciudad.").max(80),
    address: z.string().trim().min(5, "Escribe la dirección de la visita.").max(200),
    notes: z.string().trim().max(500).optional(),
  }),
  /** Authorization for personal data (Ley 1581); its version is stored with the booking. */
  acceptPrivacy: z.literal(true, "Para continuar, autoriza el tratamiento de tus datos y acepta los términos."),
  /** Honeypot: humans never fill this hidden field. */
  website: z.string().max(0).optional(),
});

export type CreateBookingResult =
  | { ok: true; whatsappUrl: string; confirmed: boolean; reference: string }
  | { ok: false; error: string; slotTaken?: boolean };

const TZ = "America/Bogota";
const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(new Date(iso));
const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit", hourCycle: "h12", timeZone: TZ }).format(new Date(iso));

export async function createBooking(input: unknown): Promise<CreateBookingResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos de la cita." };
  const { service, startsAt, customer, website } = parsed.data;
  if (website) return { ok: false, error: "No se pudo agendar la cita." };

  const ip = await getClientIp();
  const [ipOk, phoneOk] = await Promise.all([
    rateLimit(`booking:ip:${ip}`, 5, 60 * 60),
    rateLimit(`booking:phone:${customer.phone}`, 3, 60 * 60),
  ]);
  if (!ipOk || !phoneOk) return { ok: false, error: "Recibimos varias citas seguidas. Espera un momento o escríbenos por WhatsApp." };

  const { data, error } = await createAdminClient().rpc("create_booking", {
    p_customer: { ...customer, privacy_version: legal.version },
    p_service_slug: service,
    p_starts_at: startsAt,
  });
  if (error || !data) {
    if (error?.message.includes("slot_unavailable")) {
      return { ok: false, error: "Ese horario acaba de ocuparse. Elige otro, por favor.", slotTaken: true };
    }
    console.error("[createBooking]", error?.code, error?.message);
    return { ok: false, error: "No pudimos agendar la cita. Inténtalo de nuevo." };
  }

  const booking = data as { id: string; reference: string; status: string; starts_at: string; ends_at: string };
  after(() => notifyNewBooking(booking.id));
  const confirmed = booking.status === "confirmed";
  const day = dayLabel(booking.starts_at);

  const message = [
    confirmed
      ? "Hola INNOVA 👋 Agendé una visita técnica desde la página web:"
      : "Hola INNOVA 👋 Quiero agendar esta visita técnica desde la página web. ¿Me la confirman?",
    "",
    `🛠️ Servicio: ${getService(service)?.name ?? service}`,
    `📅 Fecha: ${day.charAt(0).toUpperCase()}${day.slice(1)}`,
    `🕒 Hora: ${timeLabel(booking.starts_at)} – ${timeLabel(booking.ends_at)}`,
    "",
    `👤 ${customer.name}`,
    `📞 ${customer.phone}`,
    `📍 ${customer.address}, ${customer.city}`,
    ...(customer.notes ? [`📝 ${customer.notes}`] : []),
    "",
    `Código: ${booking.reference}`,
  ].join("\n");

  const whatsapp = (await getSiteSettings())?.whatsapp ?? site.phone.raw;
  return { ok: true, confirmed, reference: booking.reference, whatsappUrl: `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` };
}
