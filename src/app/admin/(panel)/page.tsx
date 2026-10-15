import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Database, HardDrive, Package, ShoppingBag, Wallet } from "lucide-react";
import clsx from "clsx";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { planLimits } from "@/lib/admin/nav";
import { formatDateTime } from "@/lib/admin/format";
import { ORDER_STATUS, BOOKING_STATUS } from "@/lib/admin/status";
import { getService } from "@/lib/services";
import { Badge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Resumen" };

type Stats = {
  database_bytes: number;
  storage: { bytes: number; files: number };
  products: { total: number; published: number; sold_out: number };
  categories: number;
  projects: number;
  orders: { pending: number; to_fulfill: number; month_count: number; month_paid_total: number };
  bookings: { pending: number; upcoming: number };
};

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const [{ data, error }, { data: recentOrders }, { data: nextBookings }] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase.from("orders").select("id, order_number, customer_name, total, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase
      .from("bookings")
      .select("id, customer_name, service_slug, starts_at, status")
      .gte("starts_at", new Date().toISOString())
      .in("status", ["pending", "confirmed"])
      .order("starts_at")
      .limit(5),
  ]);
  const stats = data as unknown as Stats | null;

  return (
    <div className="mx-auto max-w-6xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime-400">Panel INNOVA</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Hola, {admin.displayName.split(" ")[0]}</h1>

      {error || !stats ? (
        <p className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          No se pudieron cargar las estadísticas. Recarga la página.
        </p>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard href="/admin/orders" icon={ShoppingBag} label="Pedidos por atender" value={stats.orders.to_fulfill} hint={`${stats.orders.pending} esperando pago`} />
            <StatCard href="/admin/orders?tab=all" icon={Wallet} label="Ventas pagadas del mes" value={cop.format(stats.orders.month_paid_total)} hint={`${stats.orders.month_count} pedidos este mes`} />
            <StatCard href="/admin/bookings" icon={CalendarDays} label="Citas por confirmar" value={stats.bookings.pending} hint={`${stats.bookings.upcoming} próximas en total`} />
            <StatCard href="/admin/products" icon={Package} label="Productos publicados" value={stats.products.published} hint={`${stats.products.sold_out} agotados · ${stats.categories} categorías`} />
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-2">
            <ListCard title="Últimos pedidos" href="/admin/orders" empty="Aún no hay pedidos.">
              {(recentOrders ?? []).map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      #{o.order_number} · {o.customer_name}
                    </span>
                    <span className="block text-xs text-white/45">{formatDateTime(o.created_at)}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-mono text-xs">{cop.format(o.total)}</span>
                    <Badge tone={ORDER_STATUS[o.status]?.tone}>{ORDER_STATUS[o.status]?.label}</Badge>
                  </span>
                </Link>
              ))}
            </ListCard>
            <ListCard title="Próximas citas" href="/admin/bookings" empty="No hay citas próximas.">
              {(nextBookings ?? []).map((b) => (
                <Link key={b.id} href="/admin/bookings" className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{b.customer_name}</span>
                    <span className="block text-xs text-white/45">
                      {getService(b.service_slug)?.name} · {formatDateTime(b.starts_at)}
                    </span>
                  </span>
                  <Badge tone={BOOKING_STATUS[b.status]?.tone}>{BOOKING_STATUS[b.status]?.label}</Badge>
                </Link>
              ))}
            </ListCard>
          </div>

          <h2 className="mt-12 text-lg font-bold">Almacenamiento</h2>
          <p className="mt-1 text-sm text-white/50">Plan {planLimits.name} de Supabase.</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <UsageCard icon={Database} label="Base de datos" used={stats.database_bytes} limit={planLimits.databaseBytes} />
            <UsageCard
              icon={HardDrive}
              label="Imágenes"
              used={stats.storage.bytes}
              limit={planLimits.storageBytes}
              hint={`${stats.storage.files} archivos · ${stats.projects} proyectos`}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ListCard({ title, href, empty, children }: { title: string; href: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <h2 className="text-sm font-bold">{title}</h2>
        <Link href={href} className="text-xs font-semibold text-lime-400 hover:text-white">
          Ver todo
        </Link>
      </div>
      {children.length ? <div className="divide-y divide-white/5 pb-1">{children}</div> : <p className="px-5 pb-5 pt-2 text-sm text-white/45">{empty}</p>}
    </section>
  );
}

function StatCard({ href, icon: Icon, label, value, hint }: { href: string; icon: typeof Package; label: string; value: string | number; hint?: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25">
      <div className="flex items-center gap-2 text-white/55">
        <Icon className="size-4" />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
    </Link>
  );
}

function UsageCard({ icon: Icon, label, used, limit, hint }: { icon: typeof Package; label: string; used: number; limit: number; hint?: string }) {
  const pct = Math.min(100, (used / limit) * 100);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white/55">
          <Icon className="size-4" />
          <span className="text-xs font-semibold">{label}</span>
        </div>
        <span className="font-mono text-xs text-white/55">{pct.toFixed(pct < 10 ? 1 : 0)}%</span>
      </div>
      <p className="mt-3 text-xl font-bold">
        {formatBytes(used)} <span className="text-sm font-medium text-white/45">de {formatBytes(limit)}</span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={clsx("h-full rounded-full", pct > 85 ? "bg-red-400" : pct > 65 ? "bg-amber-300" : "bg-lime-400")}
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
      </div>
      {hint && <p className="mt-2 text-xs text-white/45">{hint}</p>}
    </div>
  );
}
