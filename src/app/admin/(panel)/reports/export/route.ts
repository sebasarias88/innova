import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDay, resolveRange } from "@/lib/admin/ranges";
import { PAYMENT_METHOD } from "@/lib/admin/status";
import { buildPdf, buildWorkbook, fileResponse, type Sheet } from "@/lib/admin/exports";
import { bookingsSheet, ordersSheets } from "@/lib/admin/history";
import type { SalesReport } from "@/lib/admin/report-types";

export const runtime = "nodejs";

/** Sales report of a date range as Excel or PDF (admin only). */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (session.status !== "ok") return new Response("No autorizado", { status: 401 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "xlsx";
  const range = resolveRange({ preset: "custom", from: url.searchParams.get("from") ?? undefined, to: url.searchParams.get("to") ?? undefined });

  const supabase = await createClient();
  const [{ data, error }, { ordersSheet, itemsSheet }, bookings] = await Promise.all([
    supabase.rpc("admin_sales_report", { p_from: range.from, p_to: range.to, p_group: range.group }),
    ordersSheets(supabase, { from: range.from, to: range.to }),
    bookingsSheet(supabase, { from: range.from, to: range.to }),
  ]);
  if (error || !data) return new Response("No se pudo generar el reporte", { status: 500 });
  const r = data as unknown as SalesReport;

  const summary: Sheet = {
    name: "Resumen",
    columns: [
      { header: "Indicador", key: "k", width: 30 },
      { header: "Valor", key: "v", width: 20 },
    ],
    rows: [
      { k: "Periodo", v: range.label },
      { k: "Total vendido", v: money(r.summary.sales_total) },
      { k: "Número de ventas", v: r.summary.sales_count },
      { k: "Ticket promedio", v: money(r.summary.avg_ticket) },
      { k: "Unidades vendidas", v: r.summary.units },
      { k: "Productos (sin envío)", v: money(r.summary.products_total) },
      { k: "Envíos cobrados", v: money(r.summary.shipping_total) },
      { k: "Pagado en línea (Wompi)", v: money(r.summary.online_total) },
      { k: "Por WhatsApp", v: money(r.summary.whatsapp_total) },
      { k: "Pedidos recibidos", v: r.summary.orders },
      { k: "Pendientes", v: `${r.summary.pending_count} (${money(r.summary.pending_total)})` },
      { k: "Cancelados", v: r.summary.cancelled_count },
      { k: "Citas (confirmadas o realizadas)", v: `${r.bookings.confirmed} de ${r.bookings.total}` },
    ],
  };
  const top: Sheet = {
    name: "Más vendidos",
    columns: [
      { header: "Producto", key: "name", width: 46 },
      { header: "Unidades", key: "units", width: 12, type: "number" },
      { header: "Vendido", key: "total", width: 16, type: "money" },
    ],
    rows: r.products,
  };
  const categories: Sheet = { ...top, name: "Por categoría", columns: [{ header: "Categoría", key: "name", width: 30 }, ...top.columns.slice(1)], rows: r.categories };
  const methods: Sheet = {
    name: "Medios de pago",
    columns: [
      { header: "Medio", key: "method", width: 26 },
      { header: "Ventas", key: "count", width: 10, type: "number" },
      { header: "Total", key: "total", width: 16, type: "money" },
    ],
    rows: r.payment_methods.map((m) => ({ ...m, method: PAYMENT_METHOD[m.method] ?? m.method })),
  };

  const name = `reporte-ventas-${range.from}${range.from === range.to ? "" : `-a-${range.to}`}`;
  const title = `Reporte de ventas · ${range.from === range.to ? formatDay(range.from) : `${formatDay(range.from)} a ${formatDay(range.to)}`}`;

  if (format === "xlsx") {
    const file = await buildWorkbook(title, [summary, top, categories, methods, ordersSheet, itemsSheet, bookings]);
    return fileResponse(file, `${name}.xlsx`, "xlsx");
  }
  const pdf = buildPdf(title, `${r.summary.sales_count} ventas · ${money(r.summary.sales_total)}`, [
    { title: "Resumen", sheet: summary },
    { title: "Productos más vendidos", sheet: top, maxRows: 20 },
    { title: "Por categoría", sheet: categories },
    { title: "Medios de pago", sheet: methods },
    {
      title: "Pedidos del periodo",
      sheet: { ...ordersSheet, columns: ordersSheet.columns.filter((c) => !["customer_phone", "payment_status", "shipping_cost", "subtotal"].includes(c.key)) },
    },
  ]);
  return fileResponse(pdf, `${name}.pdf`, "pdf");
}

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
function money(v: number) {
  return cop.format(v);
}
