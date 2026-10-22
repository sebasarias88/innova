import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { bogotaToday, formatDay, resolveRange } from "@/lib/admin/ranges";
import { PageHeader, Card } from "@/components/admin/ui";
import { RangePicker } from "@/components/admin/RangePicker";
import { BarSeries, Kpi, RankList } from "@/components/admin/charts";

export const metadata: Metadata = { title: "Visitas" };

type Analytics = {
  totals: { pageviews: number; clicks: number; visitors: number; sessions: number };
  series: { day: string; pageviews: number; visitors: number; clicks: number }[];
  sources: { source: string; events: number; visitors: number }[];
  pages: { path: string; events: number; visitors: number }[];
  products: { path: string; label: string | null; events: number }[];
  devices: { device: string; events: number }[];
  cities: { city: string; events: number }[];
  clicks: { target: string; events: number }[];
  click_labels: { target: string; label: string; events: number }[];
};

const SOURCES: Record<string, string> = {
  direct: "Directo (escribieron la dirección o guardado)",
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  youtube: "YouTube",
  bing: "Bing",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  other: "Otros sitios",
};
const CLICK_TARGETS: Record<string, string> = {
  whatsapp: "Clic en WhatsApp",
  call: "Clic para llamar",
  email: "Clic en correo",
  instagram: "Ir a Instagram",
  facebook: "Ir a Facebook",
  tiktok: "Ir a TikTok",
  maps: "Abrir en Google Maps",
  external: "Enlaces externos",
  add_to_cart: "Agregó al carrito",
  order_whatsapp: "Envió pedido por WhatsApp",
  checkout_online: "Fue a pagar en línea",
  booking: "Agendó una visita",
};
const DEVICES: Record<string, string> = { mobile: "Celular", desktop: "Computador", tablet: "Tablet" };
const PAGE_NAMES: Record<string, string> = {
  "/": "Inicio",
  "/tienda": "Tienda",
  "/carrito": "Carrito",
  "/agendar": "Agendar visita",
  "/contacto": "Contacto",
  "/proyectos": "Proyectos",
  "/nosotros": "Nosotros",
  "/calculadora-solar": "Calculadora solar",
  "/pago": "Resultado del pago",
};
const n = new Intl.NumberFormat("es-CO");

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ preset?: string; from?: string; to?: string }> }) {
  await requireAdmin();
  const range = resolveRange(await searchParams, "7d");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_analytics", { p_from: range.from, p_to: range.to });
  const a = data as unknown as Analytics | null;

  const conversions = a?.clicks.filter((c) => ["order_whatsapp", "checkout_online", "booking"].includes(c.target)).reduce((s, c) => s + c.events, 0) ?? 0;
  const whatsapp = a?.clicks.find((c) => c.target === "whatsapp")?.events ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Visitas"
        description="Cuántas personas entran a la página, de dónde vienen y qué hacen. Es anónimo: no guarda nombres ni teléfonos. Tus propias visitas desde este dispositivo no se cuentan."
      />
      <RangePicker range={range} today={bogotaToday()} />
      <p className="mt-3 text-sm text-white/50">{range.label === "Hoy" ? "Hoy, en vivo." : range.label}</p>

      {error || !a ? (
        <p className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">No se pudieron cargar las visitas. Recarga la página.</p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Visitantes" value={n.format(a.totals.visitors)} hint={range.days > 1 ? "Personas distintas, sumadas por día" : "Personas distintas"} accent />
            <Kpi label="Páginas vistas" value={n.format(a.totals.pageviews)} hint={`${n.format(a.totals.sessions)} visitas (sesiones)`} />
            <Kpi label="Clics en WhatsApp" value={n.format(whatsapp)} hint="Botones y enlaces de WhatsApp" />
            <Kpi label="Pedidos y citas iniciados" value={n.format(conversions)} hint="WhatsApp, pago en línea y agenda" />
          </div>

          <Card title="Visitantes por día" className="mt-6">
            <BarSeries
              data={a.series.map((d) => ({ label: formatDay(d.day, { day: "numeric", month: "short" }), title: formatDay(d.day), value: d.visitors }))}
              format={(v) => `${n.format(v)} visitantes`}
            />
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card title="¿De dónde vienen?" description="Redes, Google, publicidad o directo.">
              <RankList items={a.sources.map((s) => ({ key: s.source, label: SOURCES[s.source] ?? s.source, value: s.visitors, sub: `${n.format(s.events)} págs.` }))} format={(v) => `${n.format(v)} pers.`} />
            </Card>
            <Card title="¿Qué hacen?" description="Clics y acciones importantes.">
              <RankList items={a.clicks.map((c) => ({ key: c.target, label: CLICK_TARGETS[c.target] ?? c.target, value: c.events }))} format={(v) => n.format(v)} empty="Aún no hay clics registrados." />
            </Card>
            <Card title="Productos más vistos">
              <RankList
                items={a.products.map((p) => ({ key: p.path, label: p.label ?? p.path.replace("/tienda/", ""), value: p.events }))}
                format={(v) => `${n.format(v)} vistas`}
                empty="Aún no hay visitas a productos."
              />
            </Card>
            <Card title="Páginas más vistas">
              <RankList items={a.pages.map((p) => ({ key: p.path, label: PAGE_NAMES[p.path] ?? p.path, value: p.events }))} format={(v) => n.format(v)} />
            </Card>
            <Card title="Ciudades" description="Aproximada, según la conexión.">
              <RankList items={a.cities.map((c) => ({ key: c.city, label: c.city, value: c.events }))} format={(v) => n.format(v)} />
            </Card>
            <Card title="Dispositivos">
              <RankList items={a.devices.map((d) => ({ key: d.device, label: DEVICES[d.device] ?? d.device, value: d.events }))} format={(v) => n.format(v)} />
            </Card>
          </div>

          {a.click_labels.length > 0 && (
            <Card title="Detalle de clics" description="Desde qué botón o con qué producto." className="mt-6">
              <RankList
                items={a.click_labels.map((c) => ({ key: `${c.target}-${c.label}`, label: `${CLICK_TARGETS[c.target] ?? c.target} · ${c.label}`, value: c.events }))}
                format={(v) => n.format(v)}
              />
            </Card>
          )}

          <p className="mt-6 text-xs leading-relaxed text-white/40">
            Para saber qué anuncio trae cada visita, usa en la publicidad enlaces con etiquetas UTM, por ejemplo{" "}
            <code className="rounded bg-white/5 px-1 py-0.5">innovaseguridad.com.co/tienda?utm_source=facebook&amp;utm_campaign=camaras-octubre</code>. Los anuncios de Meta y Google se reconocen solos.
          </p>
        </>
      )}
    </div>
  );
}
