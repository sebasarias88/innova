import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { planLimits } from "@/lib/admin/nav";
import { bogotaToday, formatDay } from "@/lib/admin/ranges";
import { Card, PageHeader } from "@/components/admin/ui";
import { RankList } from "@/components/admin/charts";
import { CleanupPanel } from "./CleanupPanel";

export const metadata: Metadata = { title: "Almacenamiento" };

type Usage = {
  database_bytes: number;
  media: { bytes: number; files: number };
  tables: { name: string; bytes: number; rows: number }[];
  oldest: { orders: string | null; bookings: string | null; analytics: string | null; audit: string | null };
};

const TABLES: Record<string, string> = {
  orders: "Pedidos",
  order_items: "Productos de los pedidos",
  payment_events: "Registros de pagos (Wompi)",
  bookings: "Citas",
  analytics_events: "Visitas detalladas (se borran solas a los 30 días)",
  analytics_daily: "Resumen diario de visitas",
  audit_log: "Registro de cambios del panel",
  products: "Productos",
};

function bytes(n: number) {
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

const shift = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export default async function StoragePage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_storage_usage");
  const u = data as unknown as Usage | null;
  const today = bogotaToday();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Almacenamiento"
        description="Cuánto espacio usa la tienda en el plan gratuito. Cuando se acerque al límite, descarga un respaldo del historial viejo y límpialo desde aquí."
      />
      {error || !u ? (
        <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">No se pudo cargar el uso. Recarga la página.</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Meter label="Base de datos" used={u.database_bytes} limit={planLimits.databaseBytes} />
            <Meter label="Imágenes" used={u.media.bytes} limit={planLimits.storageBytes} hint={`${u.media.files} archivos`} />
          </div>

          <Card title="¿Qué ocupa espacio?" className="mt-6">
            <RankList
              items={u.tables.map((t) => ({ key: t.name, label: TABLES[t.name] ?? t.name, value: t.bytes, sub: `${new Intl.NumberFormat("es-CO").format(t.rows)} reg.` }))}
              format={bytes}
            />
            <p className="mt-4 text-xs text-white/45">
              Lo más antiguo: pedidos {u.oldest.orders ? formatDay(u.oldest.orders.slice(0, 10)) : "—"} · citas{" "}
              {u.oldest.bookings ? formatDay(u.oldest.bookings.slice(0, 10)) : "—"} · registro de cambios {u.oldest.audit ? formatDay(u.oldest.audit.slice(0, 10)) : "—"}.
            </p>
          </Card>

          <Card title="Respaldar y limpiar historial" description="Libera espacio sin perder información: primero se descarga, después se borra." className="mt-6">
            <CleanupPanel maxCutoff={shift(today, -31)} defaultCutoff={shift(today, -180)} />
          </Card>
        </>
      )}
    </div>
  );
}

function Meter({ label, used, limit, hint }: { label: string; used: number; limit: number; hint?: string }) {
  const pct = Math.min(100, (used / limit) * 100);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">{label}</p>
        <p className="font-mono text-xs text-white/60">
          {bytes(used)} de {bytes(limit)}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={pct > 85 ? "h-full bg-red-400" : pct > 65 ? "h-full bg-amber-300" : "h-full bg-lime-400"} style={{ width: `${Math.max(1, pct)}%` }} />
      </div>
      <p className="mt-2 text-xs text-white/45">
        {pct.toFixed(1)}% usado{hint ? ` · ${hint}` : ""}
        {pct > 80 && " · Es momento de respaldar y limpiar."}
      </p>
    </div>
  );
}
