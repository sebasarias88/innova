import type { Metadata } from "next";
import { CalendarDays, Database, HardDrive, Package, ShoppingBag, Wallet } from "lucide-react";
import clsx from "clsx";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { planLimits } from "@/lib/admin/nav";

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
  const { data, error } = await supabase.rpc("admin_dashboard_stats");
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
            <StatCard icon={ShoppingBag} label="Pedidos por atender" value={stats.orders.to_fulfill} hint={`${stats.orders.pending} esperando pago`} />
            <StatCard icon={Wallet} label="Ventas pagadas del mes" value={cop.format(stats.orders.month_paid_total)} hint={`${stats.orders.month_count} pedidos este mes`} />
            <StatCard icon={CalendarDays} label="Citas por confirmar" value={stats.bookings.pending} hint={`${stats.bookings.upcoming} próximas en total`} />
            <StatCard icon={Package} label="Productos publicados" value={stats.products.published} hint={`${stats.products.sold_out} agotados · ${stats.categories} categorías`} />
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

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof Package; label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-white/55">
        <Icon className="size-4" />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
    </div>
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
