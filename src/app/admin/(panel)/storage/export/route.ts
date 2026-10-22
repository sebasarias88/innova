import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { bogotaToday, formatDay } from "@/lib/admin/ranges";
import { buildPdf, buildWorkbook, fileResponse } from "@/lib/admin/exports";
import { bookingsSheet, ordersSheets, paymentsSheet, visitsSheet } from "@/lib/admin/history";

export const runtime = "nodejs";

/**
 * Backup of all history before a cut-off date (Excel with every detail, or a
 * PDF summary). Downloading it is what enables "clean" for that same date.
 */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (session.status !== "ok") return new Response("No autorizado", { status: 401 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "xlsx";
  const cutoff = url.searchParams.get("cutoff") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoff) || cutoff > bogotaToday()) return new Response("Fecha no válida", { status: 400 });

  const supabase = await createClient();
  const [{ ordersSheet, itemsSheet, customersSheet }, bookings, payments, visits] = await Promise.all([
    ordersSheets(supabase, { before: cutoff }),
    bookingsSheet(supabase, { before: cutoff }),
    paymentsSheet(supabase, cutoff),
    visitsSheet(supabase, cutoff),
  ]);

  const title = `Respaldo del historial anterior al ${formatDay(cutoff)}`;
  const file =
    format === "xlsx"
      ? await buildWorkbook(title, [ordersSheet, itemsSheet, customersSheet, bookings, payments, visits])
      : buildPdf(title, `${ordersSheet.rows.length} pedidos · ${bookings.rows.length} citas`, [
          { title: "Pedidos", sheet: ordersSheet },
          { title: "Citas", sheet: bookings },
          { title: "Pagos Wompi", sheet: payments },
          { title: "Visitas por día", sheet: visits },
        ]);

  // Recorded only after the file was built successfully.
  const { error } = await supabase.rpc("admin_record_export", { p_cutoff: cutoff });
  if (error) return new Response("No se pudo registrar el respaldo", { status: 500 });

  return fileResponse(file, `respaldo-innova-antes-de-${cutoff}.${format}`, format);
}
