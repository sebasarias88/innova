import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { uuid } from "@/lib/admin/actions";
import { formatCop, formatDateTime, whatsappUrl } from "@/lib/admin/format";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/admin/status";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { OrderStatusForm } from "../OrderStatusForm";
import { updateOrder } from "../actions";
import { storeToCustomerOrderMessage } from "@/lib/shop/messages";

export const metadata: Metadata = { title: "Pedido" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("id, product_name, product_slug, unit_price, quantity, line_total").eq("order_id", id),
  ]);
  if (!order) notFound();

  const status = ORDER_STATUS[order.status];
  const payment = PAYMENT_STATUS[order.payment_status];
  const canEditShipping = order.payment_method === "whatsapp" && order.payment_status !== "approved";
  const statuses = Object.entries(ORDER_STATUS)
    .filter(([value]) => order.payment_method === "wompi" || !["awaiting_payment", "paid"].includes(value) || value === order.status)
    .map(([value, s]) => ({ value, label: s.label }));
  const message = storeToCustomerOrderMessage({
    firstName: order.customer_name.split(" ")[0],
    reference: order.reference,
    items: (items ?? []).map((i) => ({ name: i.product_name, quantity: i.quantity })),
    total: order.total,
    paid: order.payment_status === "approved",
    shippingPending: order.shipping_cost === null,
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Pedido #${order.order_number}`}
        description={`${formatDateTime(order.created_at)} · Código ${order.reference}`}
        back={{ href: "/admin/orders", label: "Pedidos" }}
        actions={<Badge tone={status?.tone}>{status?.label ?? order.status}</Badge>}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card title="Productos">
            <ul className="divide-y divide-white/5">
              {(items ?? []).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <div className="min-w-0">
                    <p className="font-medium">{i.product_name}</p>
                    <p className="text-xs text-white/45">
                      {i.quantity} × {formatCop(i.unit_price)}
                    </p>
                  </div>
                  <p className="font-mono text-sm">{formatCop(i.line_total)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
              <Row label="Subtotal" value={formatCop(order.subtotal)} />
              <Row label={`Envío · ${order.shipping_zone_name}`} value={order.shipping_cost === 0 ? "Gratis" : formatCop(order.shipping_cost)} />
              {order.payment_method === "wompi" && order.shipping_cost === null && (
                <p className="rounded-xl bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                  El pago en línea cubre solo los productos. Coordina el envío con el cliente por WhatsApp (contra entrega u otra forma).
                </p>
              )}
              <Row label="Total" value={formatCop(order.total)} strong />
            </dl>
          </Card>

          <Card title="Cliente">
            <p className="text-lg font-semibold">{order.customer_name}</p>
            {order.customer_document && <p className="text-sm text-white/50">Documento: {order.customer_document}</p>}
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-white/40" /> {order.customer_phone}
              </li>
              {order.customer_email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="size-4 text-white/40" /> {order.customer_email}
                </li>
              )}
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 text-white/40" /> {[order.address, order.city].filter(Boolean).join(", ")}
              </li>
            </ul>
            {order.notes && <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-white/70">“{order.notes}”</p>}
            <p className="mt-4 text-xs text-white/40">
              {order.privacy_accepted_at
                ? `Autorizó el tratamiento de datos el ${formatDateTime(order.privacy_accepted_at)} (política ${order.privacy_version}).`
                : "Pedido anterior a la casilla de autorización de datos."}
            </p>
            <a
              href={whatsappUrl(order.customer_phone, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-navy-950 hover:brightness-110"
            >
              <MessageCircle className="size-4" /> Escribir por WhatsApp
            </a>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Pago">
            <p className="text-sm text-white/70">{PAYMENT_METHOD[order.payment_method]}</p>
            <div className="mt-2">
              <Badge tone={payment?.tone}>{payment?.label ?? order.payment_status}</Badge>
            </div>
            {order.wompi_transaction_id && <p className="mt-3 break-all font-mono text-xs text-white/45">Transacción: {order.wompi_transaction_id}</p>}
            {order.paid_at && <p className="mt-1 text-xs text-white/45">Pagado: {formatDateTime(order.paid_at)}</p>}
          </Card>
          <Card title="Gestión">
            <OrderStatusForm
              action={updateOrder.bind(null, id)}
              status={order.status}
              statuses={statuses}
              internalNotes={order.internal_notes}
              shippingCost={order.shipping_cost}
              canEditShipping={canEditShipping}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "text-base font-bold" : "text-white/70"}`}>
      <dt>{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
