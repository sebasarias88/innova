import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BOOKING_STATUS, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/admin/status";
import { getService } from "@/lib/services";
import type { Sheet } from "@/lib/admin/exports";

type Client = SupabaseClient<Database>;

/** Colombia has no daylight saving time: its offset is always -05:00. */
export const startOf = (day: string) => `${day}T00:00:00-05:00`;
export const endOf = (day: string) => `${day}T23:59:59.999-05:00`;

const PAGE = 1000;
/** Reads every row in pages of 1000 (the API maximum per request). */
async function all<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>, cap = 50_000) {
  const rows: T[] = [];
  for (let from = 0; from < cap; from += PAGE) {
    const { data, error } = await fetchPage(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

export async function ordersSheets(supabase: Client, range: { from?: string; to?: string; before?: string }) {
  const orders = await all((a, b) => {
    let q = supabase
      .from("orders")
      .select(
        "id, order_number, reference, created_at, paid_at, status, payment_method, payment_status, customer_name, customer_phone, customer_email, customer_document, city, address, shipping_zone_name, shipping_cost, subtotal, total, notes, internal_notes, order_items(product_name, quantity, unit_price, line_total)",
      )
      .order("created_at")
      .range(a, b);
    if (range.from) q = q.gte("created_at", startOf(range.from));
    if (range.to) q = q.lte("created_at", endOf(range.to));
    if (range.before) q = q.lt("created_at", startOf(range.before));
    return q;
  });

  const ordersSheet: Sheet = {
    name: "Pedidos",
    columns: [
      { header: "N.º", key: "order_number", width: 8, type: "number" },
      { header: "Código", key: "reference", width: 18 },
      { header: "Fecha", key: "created_at", width: 17, type: "date" },
      { header: "Estado", key: "status", width: 14 },
      { header: "Medio", key: "payment_method", width: 20 },
      { header: "Pago", key: "payment_status", width: 16 },
      { header: "Cliente", key: "customer_name", width: 24 },
      { header: "Celular", key: "customer_phone", width: 14 },
      { header: "Ciudad", key: "city", width: 14 },
      { header: "Envío", key: "shipping_zone_name", width: 18 },
      { header: "Costo envío", key: "shipping_cost", width: 13, type: "money" },
      { header: "Productos", key: "subtotal", width: 14, type: "money" },
      { header: "Total", key: "total", width: 14, type: "money" },
      { header: "Detalle", key: "items", width: 50 },
    ],
    rows: orders.map((o) => ({
      ...o,
      status: ORDER_STATUS[o.status]?.label ?? o.status,
      payment_method: PAYMENT_METHOD[o.payment_method] ?? o.payment_method,
      payment_status: PAYMENT_STATUS[o.payment_status]?.label ?? o.payment_status,
      shipping_cost: o.shipping_cost,
      items: (o.order_items ?? []).map((i) => `${i.quantity} × ${i.product_name}`).join("; "),
    })),
  };

  const itemsSheet: Sheet = {
    name: "Productos vendidos",
    columns: [
      { header: "Pedido", key: "reference", width: 18 },
      { header: "Fecha", key: "created_at", width: 17, type: "date" },
      { header: "Estado", key: "status", width: 14 },
      { header: "Producto", key: "product_name", width: 44 },
      { header: "Cantidad", key: "quantity", width: 10, type: "number" },
      { header: "Precio unitario", key: "unit_price", width: 15, type: "money" },
      { header: "Total línea", key: "line_total", width: 15, type: "money" },
    ],
    rows: orders.flatMap((o) =>
      (o.order_items ?? []).map((i) => ({ ...i, reference: o.reference, created_at: o.created_at, status: ORDER_STATUS[o.status]?.label ?? o.status })),
    ),
  };

  // Full customer data only in the backup (Excel), not in the summary PDF.
  const customersSheet: Sheet = {
    name: "Datos de clientes",
    columns: [
      { header: "Código", key: "reference", width: 18 },
      { header: "Cliente", key: "customer_name", width: 24 },
      { header: "Celular", key: "customer_phone", width: 14 },
      { header: "Correo", key: "customer_email", width: 26 },
      { header: "Documento", key: "customer_document", width: 14 },
      { header: "Ciudad", key: "city", width: 14 },
      { header: "Dirección", key: "address", width: 34 },
      { header: "Notas del cliente", key: "notes", width: 30 },
      { header: "Notas internas", key: "internal_notes", width: 30 },
    ],
    rows: orders,
  };

  return { orders, ordersSheet, itemsSheet, customersSheet };
}

export async function bookingsSheet(supabase: Client, range: { from?: string; to?: string; before?: string }): Promise<Sheet> {
  const bookings = await all((a, b) => {
    let q = supabase
      .from("bookings")
      .select("reference, starts_at, ends_at, status, service_slug, customer_name, customer_phone, customer_email, city, address, notes, created_at")
      .order("starts_at")
      .range(a, b);
    if (range.from) q = q.gte("starts_at", startOf(range.from));
    if (range.to) q = q.lte("starts_at", endOf(range.to));
    if (range.before) q = q.lt("starts_at", startOf(range.before));
    return q;
  });
  return {
    name: "Citas",
    columns: [
      { header: "Código", key: "reference", width: 16 },
      { header: "Fecha y hora", key: "starts_at", width: 17, type: "date" },
      { header: "Estado", key: "status", width: 14 },
      { header: "Servicio", key: "service", width: 26 },
      { header: "Cliente", key: "customer_name", width: 24 },
      { header: "Celular", key: "customer_phone", width: 14 },
      { header: "Ciudad", key: "city", width: 14 },
      { header: "Dirección", key: "address", width: 32 },
      { header: "Notas", key: "notes", width: 30 },
    ],
    rows: bookings.map((b) => ({ ...b, status: BOOKING_STATUS[b.status]?.label ?? b.status, service: getService(b.service_slug)?.name ?? b.service_slug })),
  };
}

export async function paymentsSheet(supabase: Client, before: string): Promise<Sheet> {
  const events = await all((a, b) =>
    supabase.from("payment_events").select("received_at, reference, transaction_id, event, status, amount_in_cents").lt("received_at", startOf(before)).order("received_at").range(a, b),
  );
  return {
    name: "Pagos Wompi",
    columns: [
      { header: "Fecha", key: "received_at", width: 17, type: "date" },
      { header: "Pedido", key: "reference", width: 18 },
      { header: "Transacción", key: "transaction_id", width: 26 },
      { header: "Evento", key: "event", width: 22 },
      { header: "Estado", key: "status", width: 12 },
      { header: "Valor", key: "amount", width: 14, type: "money" },
    ],
    rows: events.map((e) => ({ ...e, amount: e.amount_in_cents === null ? null : Math.round(e.amount_in_cents / 100) })),
  };
}

export async function visitsSheet(supabase: Client, before: string): Promise<Sheet> {
  const days = await all((a, b) => supabase.from("analytics_days").select("day, visitors, sessions, pageviews, clicks").lt("day", before).order("day").range(a, b));
  return {
    name: "Visitas por día",
    columns: [
      { header: "Día", key: "day", width: 12 },
      { header: "Visitantes", key: "visitors", width: 12, type: "number" },
      { header: "Visitas", key: "sessions", width: 12, type: "number" },
      { header: "Páginas vistas", key: "pageviews", width: 14, type: "number" },
      { header: "Clics", key: "clicks", width: 10, type: "number" },
    ],
    rows: days,
  };
}
