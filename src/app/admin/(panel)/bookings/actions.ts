"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { checkbox, dbError, fail, firstIssue, formToObject, ok, optionalText, uuid, type ActionResult } from "@/lib/admin/actions";

const PAGE = "/admin/bookings";
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora no válida.");
const slot = z.coerce.number().int().min(15, "Mínimo 15 minutos.").max(480, "Máximo 8 horas.");

// ── Bookings ────────────────────────────────────────────────────────────
const bookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"], "Estado no válido."),
  internal_notes: optionalText(1000),
});

export async function updateBooking(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Identificador no válido.");
  const parsed = bookingSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update(parsed.data).eq("id", id);
  if (error) return fail(dbError(error));
  revalidatePath(PAGE);
  return ok("Cita actualizada.");
}

// ── Weekly rules ────────────────────────────────────────────────────────
const ruleSchema = z
  .object({ weekday: z.coerce.number().int().min(0).max(6), start_time: time, end_time: time, slot_minutes: slot })
  .refine((r) => r.end_time > r.start_time, "La hora final debe ser posterior a la inicial.");

export async function addRule(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = ruleSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const supabase = await createClient();

  // Avoid overlapping ranges on the same day.
  const { data: sameDay } = await supabase.from("availability_rules").select("start_time, end_time").eq("weekday", parsed.data.weekday);
  const overlaps = (sameDay ?? []).some((r) => parsed.data.start_time < r.end_time.slice(0, 5) && parsed.data.end_time > r.start_time.slice(0, 5));
  if (overlaps) return fail("Ese horario se cruza con otro del mismo día.");

  const { error } = await supabase.from("availability_rules").insert(parsed.data);
  if (error) return fail(dbError(error));
  revalidatePath(PAGE);
  return ok("Horario agregado.");
}

export async function toggleRule(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success || typeof isActive !== "boolean") return fail("Datos no válidos.");
  const supabase = await createClient();
  const { error } = await supabase.from("availability_rules").update({ is_active: isActive }).eq("id", id);
  if (error) return fail(dbError(error));
  revalidatePath(PAGE);
  return ok();
}

export async function deleteRule(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Identificador no válido.");
  const supabase = await createClient();
  const { error } = await supabase.from("availability_rules").delete().eq("id", id);
  if (error) return fail(dbError(error, "No se pudo eliminar."));
  revalidatePath(PAGE);
  return ok();
}

// ── Special dates ───────────────────────────────────────────────────────
const exceptionSchema = z
  .object({
    date: z.iso.date("Fecha no válida."),
    mode: z.enum(["closed", "special"]),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    slot_minutes: z.string().optional(),
    note: optionalText(160),
  })
  .transform((d, ctx): { date: string; is_closed: boolean; start_time: string | null; end_time: string | null; slot_minutes: number; note: string | null } => {
    if (d.mode === "closed") return { date: d.date, is_closed: true, start_time: null, end_time: null, slot_minutes: 60, note: d.note };
    const s = time.safeParse(d.start_time);
    const e = time.safeParse(d.end_time);
    const m = slot.safeParse(d.slot_minutes || "60");
    if (!s.success || !e.success || !m.success || e.data <= s.data) {
      ctx.addIssue({ code: "custom", message: "Revisa el horario especial (inicio, fin y duración)." });
      return z.NEVER;
    }
    return { date: d.date, is_closed: false, start_time: s.data, end_time: e.data, slot_minutes: m.data, note: d.note };
  });

export async function addException(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = exceptionSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const supabase = await createClient();
  const { error } = await supabase.from("availability_exceptions").insert(parsed.data);
  if (error) return fail(dbError(error));
  revalidatePath(PAGE);
  return ok(parsed.data.is_closed ? "Día marcado como cerrado." : "Horario especial agregado.");
}

export async function deleteException(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Identificador no válido.");
  const supabase = await createClient();
  const { error } = await supabase.from("availability_exceptions").delete().eq("id", id);
  if (error) return fail(dbError(error, "No se pudo eliminar."));
  revalidatePath(PAGE);
  return ok();
}

// ── Settings ────────────────────────────────────────────────────────────
const settingsSchema = z.object({
  is_enabled: checkbox,
  lead_time_hours: z.coerce.number().int().min(0, "Mínimo 0 horas.").max(336, "Máximo 336 horas (14 días)."),
  max_days_ahead: z.coerce.number().int().min(1, "Mínimo 1 día.").max(180, "Máximo 180 días."),
});

export async function saveBookingSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const supabase = await createClient();
  const { error } = await supabase.from("booking_settings").update(parsed.data).eq("id", 1);
  if (error) return fail(dbError(error));
  revalidatePath(PAGE);
  return ok("Ajustes guardados.");
}
