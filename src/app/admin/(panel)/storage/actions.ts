"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/admin/actions";

const ERRORS: Record<string, string> = {
  export_required: "Primero descarga el respaldo (Excel o PDF) de esta misma fecha. Después tienes 2 horas para limpiar.",
  cutoff_too_recent: "Solo se puede limpiar historial de hace más de 30 días.",
  confirmation_required: "Escribe BORRAR para confirmar.",
};

/** Deletes old history (after its backup was downloaded). */
export async function purgeHistory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const cutoff = String(formData.get("cutoff") ?? "");
  const confirm = String(formData.get("confirm") ?? "").trim().toUpperCase();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoff)) return fail("Elige una fecha.");
  if (confirm !== "BORRAR") return fail(ERRORS.confirmation_required);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_purge_before", { p_cutoff: cutoff, p_confirm: confirm });
  if (error) {
    const known = Object.keys(ERRORS).find((k) => error.message.includes(k));
    if (!known) console.error("[purge]", error.code, error.message);
    return fail(known ? ERRORS[known] : "No se pudo limpiar. Inténtalo de nuevo.");
  }
  const d = data as { orders: number; bookings: number; payment_events: number; analytics_events: number };
  revalidatePath("/admin/storage");
  revalidatePath("/admin");
  return ok(`Listo: se borraron ${d.orders} pedidos, ${d.bookings} citas, ${d.payment_events} registros de pago y ${d.analytics_events} visitas detalladas.`);
}
