import type { Metadata } from "next";
import { FileSpreadsheet, FileText } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { bogotaToday, formatDay, resolveRange } from "@/lib/admin/ranges";
import { ORDER_STATUS, PAYMENT_METHOD } from "@/lib/admin/status";
import { getService } from "@/lib/services";
import { Card, PageHeader } from "@/components/admin/ui";
import { RangePicker } from "@/components/admin/RangePicker";
import { BarSeries, Kpi, RankList } from "@/components/admin/charts";
import type { SalesReport } from "@/lib/admin/report-types";

export const metadata: Metadata = { title: "Reportes" };

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const n = new Intl.NumberFormat("es-CO");
const money = (v: number) => cop.format(v);

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ preset?: string; from?: string; to?: string }> }) {
  await requireAdmin();
  const range = resolveRange(await searchParams, "month");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_sales_report", { p_from: range.from, p_to: range.to, p_group: range.group });
  const r = data as unknown as SalesReport | null;
  const exportHref = (format: "xlsx" | "pdf") => `/admin/reports/export?${new URLSearchParams({ format, from: range.from, to: range.to })}`;
  const bucketLabel = (iso: string) =>
    range.group === "month" ? formatDay(iso, { month: "short", year: "2-digit" }) : formatDay(iso, { day: "numeric", month: "short" });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Reportes de ventas"
        description="Cuánto se ha vendido y qué se vende más. Cuenta como venta un pedido pagado, confirmado, enviado o entregado."
        actions={
          <>
            <a href={exportHref("xlsx")} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:border-lime-400 hover:text-lime-300">
              <FileSpreadsheet className="size-4" /> Excel
            </a>
            <a href={exportHref("pdf")} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:border-lime-400 hover:text-lime-300">
              <FileText className="size-4" /> PDF
            </a>
          </>
        }
      />
      <RangePicker range={range} today={bogotaToday()} />
      <p className="mt-3 text-sm text-white/50">{range.label}</p>

      {error || !r ? (
        <p className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">No se pudo cargar el reporte. Recarga la página.</p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Total vendido" value={money(r.summary.sales_total)} hint={`${n.format(r.summary.sales_count)} ventas`} accent />
            <Kpi label="Ticket promedio" value={money(r.summary.avg_ticket)} hint={`${n.format(r.summary.units)} unidades vendidas`} />
            <Kpi label="Pendientes" value={n.format(r.summary.pending_count)} hint={`${money(r.summary.pending_total)} sin confirmar`} />
            <Kpi label="Pedidos recibidos" value={n.format(r.summary.orders)} hint={`${n.format(r.summary.cancelled_count)} cancelados`} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Pagado en línea (Wompi)" value={money(r.summary.online_total)} />
            <Kpi label="Por WhatsApp" value={money(r.summary.whatsapp_total)} />
            <Kpi label="Productos" value={money(r.summary.products_total)} hint="Sin envíos" />
            <Kpi label="Envíos cobrados" value={money(r.summary.shipping_total)} />
          </div>

          <Card title={`Ventas por ${range.group === "day" ? "día" : range.group === "week" ? "semana" : "mes"}`} className="mt-6">
            <BarSeries
              data={r.series.map((s) => ({ label: bucketLabel(s.bucket), title: `${bucketLabel(s.bucket)} · ${n.format(s.sales)} ventas`, value: s.total }))}
              format={money}
              empty="No hubo ventas en este rango."
            />
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card title="Productos más vendidos" description="Por valor vendido.">
              <RankList items={r.products.map((p) => ({ key: p.name, label: p.name, value: p.total, sub: `${n.format(p.units)} u.` }))} format={money} empty="Sin ventas." />
            </Card>
            <Card title="Por categoría">
              <RankList items={r.categories.map((c) => ({ key: c.name, label: c.name, value: c.total, sub: `${n.format(c.units)} u.` }))} format={money} empty="Sin ventas." />
            </Card>
            <Card title="Medio de pago">
              <RankList
                items={r.payment_methods.map((m) => ({ key: m.method, label: PAYMENT_METHOD[m.method] ?? m.method, value: m.total, sub: `${n.format(m.count)}` }))}
                format={money}
                empty="Sin ventas."
              />
            </Card>
            <Card title="Ciudades">
              <RankList items={r.cities.map((c) => ({ key: c.name, label: c.name, value: c.total, sub: `${n.format(c.count)}` }))} format={money} empty="Sin ventas." />
            </Card>
            <Card title="Tipo de entrega">
              <RankList items={r.zones.map((z) => ({ key: z.name, label: z.name, value: z.total, sub: `${n.format(z.count)}` }))} format={money} empty="Sin ventas." />
            </Card>
            <Card title="Estado de los pedidos">
              <RankList items={r.statuses.map((s) => ({ key: s.status, label: ORDER_STATUS[s.status]?.label ?? s.status, value: s.count }))} format={(v) => n.format(v)} empty="Sin pedidos." />
            </Card>
          </div>

          <Card title="Citas técnicas" description="Por fecha de la visita." className="mt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Kpi label="Total" value={n.format(r.bookings.total)} />
              <Kpi label="Confirmadas o realizadas" value={n.format(r.bookings.confirmed)} />
              <Kpi label="Por confirmar" value={n.format(r.bookings.pending)} />
              <Kpi label="Canceladas" value={n.format(r.bookings.cancelled)} />
            </div>
            {r.bookings.services.length > 0 && (
              <div className="mt-5">
                <RankList items={r.bookings.services.map((s) => ({ key: s.service, label: getService(s.service)?.name ?? s.service, value: s.count }))} format={(v) => n.format(v)} />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
