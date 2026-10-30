import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { LinkPending } from "@/components/ui/LinkPending";
import Form from "next/form";
import { SearchStatusIcon } from "@/components/admin/FilterSubmit";
import { SearchInput } from "@/components/ui/SearchInput";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { formatCop, formatDateTime } from "@/lib/admin/format";
import { ORDER_STATUS, PAYMENT_METHOD } from "@/lib/admin/status";
import { Badge, EmptyState, PageHeader, Pagination, Table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Pedidos" };

const PAGE_SIZE = 25;
const TABS = [
  { value: "open", label: "Por atender", statuses: ["pending", "paid", "confirmed"] },
  { value: "shipped", label: "Enviados", statuses: ["shipped"] },
  { value: "delivered", label: "Entregados", statuses: ["delivered"] },
  { value: "cancelled", label: "Cancelados", statuses: ["cancelled"] },
  // Online orders whose payment was not completed (abandoned or declined).
  { value: "unpaid", label: "Sin pagar", statuses: ["awaiting_payment"] },
  { value: "all", label: "Todos", statuses: null },
] as const;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.value === sp.tab) ?? TABS[0];
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim().slice(0, 60);

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_phone, city, total, status, payment_method, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (tab.statuses) query = query.in("status", [...tab.statuses]);
  if (q) {
    const num = Number(q.replace(/\D/g, ""));
    const term = `%${q.replace(/[%_,()]/g, " ")}%`;
    query = query.or(
      [`customer_name.ilike.${term}`, `customer_phone.ilike.${term}`, `reference.ilike.${term}`, ...(num && num < 2_000_000_000 ? [`order_number.eq.${num}`] : [])].join(","),
    );
  }
  const { data: orders, count } = await query;

  const href = (params: Record<string, string>) => `/admin/orders?${new URLSearchParams({ tab: tab.value, ...(q && { q }), ...params })}`;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Pedidos" description="Pedidos de la tienda: por WhatsApp y pagos en línea." />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={`/admin/orders?tab=${t.value}`}
              className={clsx("relative whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold", t.value === tab.value ? "bg-white text-navy-900" : "text-white/60 hover:bg-white/5 hover:text-white")}
            >
              <LinkPending>{t.label}</LinkPending>
            </Link>
          ))}
        </nav>
        <Form key={`${tab.value}|${q}`} action="/admin/orders" className="relative lg:w-80">
          <input type="hidden" name="tab" value={tab.value} />
          <SearchStatusIcon className="absolute left-3.5 top-1/2 -translate-y-1/2" />
          <SearchInput
            defaultValue={q}
            clearHref={`/admin/orders?tab=${tab.value}`}
            placeholder="N.º, código INN-…, nombre o celular"
            ariaLabel="Buscar pedidos"
            maxLength={60}
            clearClassName="right-1"
            className="w-full rounded-xl border border-white/10 bg-navy-950/60 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-lime-400/70"
          />
        </Form>
      </div>

      {!orders?.length ? (
        <EmptyState title="No hay pedidos aquí" description={q ? "Prueba con otra búsqueda." : "Cuando un cliente haga un pedido aparecerá en esta lista."} />
      ) : (
        <>
          <Table head={["Pedido", "Cliente", "Total", "Método", "Estado"]}>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold hover:text-lime-300">
                    #{o.order_number}
                  </Link>
                  <span className="block text-xs text-white/40">{formatDateTime(o.created_at)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="block">{o.customer_name}</span>
                  <span className="block text-xs text-white/40">{o.city}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{formatCop(o.total)}</td>
                <td className="px-4 py-3 text-xs text-white/60">{PAYMENT_METHOD[o.payment_method]}</td>
                <td className="px-4 py-3">
                  <Badge tone={ORDER_STATUS[o.status]?.tone}>{ORDER_STATUS[o.status]?.label ?? o.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} hrefFor={(p) => href({ page: String(p) })} />
        </>
      )}
    </div>
  );
}
