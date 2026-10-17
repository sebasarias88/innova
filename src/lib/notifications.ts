import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getService } from "@/lib/services";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";
import { waUrl } from "@/lib/whatsapp";
import { storeToCustomerOrderMessage } from "@/lib/shop/messages";

/**
 * E-mail alerts to the owners (new orders, approved payments, booking requests)
 * sent with Resend (https://resend.com).
 *
 * Environment variables (server-only, Vercel):
 *   RESEND_API_KEY   re_…  (without it, nothing is sent and nothing breaks)
 *   NOTIFY_FROM      optional, e.g. "INNOVA Seguridad y Sistemas <avisos@innovaseguridad.com.co>"
 *
 * Recipient and on/off switches come from the admin panel (Ajustes → Notificaciones).
 * Every function here swallows its own errors: an alert must never break a sale.
 */

const TZ = "America/Bogota";
const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const money = (v: number | null) => (v === null ? "A convenir" : v === 0 ? "Gratis" : cop.format(v));
const when = (iso: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-CO", { timeZone: TZ, hourCycle: "h12", ...opts }).format(new Date(iso));

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");


type Kind = "orders" | "bookings";

async function recipients(kind: Kind): Promise<string[] | null> {
  const { data } = await createAdminClient()
    .from("admin_settings")
    .select("notification_email, notify_new_orders, notify_new_bookings")
    .eq("id", 1)
    .maybeSingle();
  if (data && !(kind === "orders" ? data.notify_new_orders : data.notify_new_bookings)) return null;
  return [data?.notification_email || site.email];
}

async function send(kind: Kind, idempotencyKey: string, mail: { subject: string; html: string; text: string; replyTo?: string }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return; // notifications not configured yet
  try {
    const to = await recipients(kind);
    if (!to) return;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "idempotency-key": idempotencyKey },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM?.trim() || "INNOVA Seguridad y Sistemas <avisos@innovaseguridad.com.co>",
        to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(mail.replyTo && { reply_to: mail.replyTo }),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[notify] resend responded", res.status, (await res.text()).slice(0, 200));
  } catch (e) {
    console.error("[notify] failed:", e instanceof Error ? e.message : e);
  }
}

// ── Layout ───────────────────────────────────────────────────────────────

function layout({ eyebrow, title, rows, body, buttons }: { eyebrow: string; title: string; rows: [string, string][]; body?: string; buttons: { label: string; href: string; color: string }[] }) {
  const tr = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:38%;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600">${v}</td></tr>`,
    )
    .join("");
  const btns = buttons
    .map(
      (b) =>
        `<a href="${esc(b.href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 20px;border-radius:999px;background:${b.color};color:#020817;font-weight:700;font-size:14px;text-decoration:none">${esc(b.label)}</a>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:#020817;border-radius:16px 16px 0 0;padding:20px 24px">
    <div style="color:#3a78ff;font-size:12px;font-weight:700;letter-spacing:3px">INNOVA · ${esc(eyebrow)}</div>
    <div style="color:#ffffff;font-size:22px;font-weight:700;margin-top:6px">${esc(title)}</div>
  </div>
  <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:20px 24px">
    <table style="width:100%;border-collapse:collapse">${tr}</table>
    ${body ?? ""}
    <div style="margin-top:20px">${btns}</div>
  </div>
  <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:16px">Aviso automático de ${esc(site.name)}. Puedes cambiar a quién llega en el panel → Ajustes.</p>
</div></body></html>`;
}

// ── Orders ───────────────────────────────────────────────────────────────

async function loadOrder(match: { id?: string; reference?: string }) {
  let query = createAdminClient()
    .from("orders")
    .select(
      "id, order_number, reference, payment_method, payment_status, customer_name, customer_phone, customer_email, city, address, notes, shipping_zone_name, shipping_cost, subtotal, total, order_items(product_name, quantity, line_total)",
    );
  query = match.id ? query.eq("id", match.id) : query.eq("reference", match.reference ?? "");
  const { data } = await query.maybeSingle();
  return data;
}

function orderMail(order: NonNullable<Awaited<ReturnType<typeof loadOrder>>>, paid: boolean) {
  const items = order.order_items ?? [];
  const list = items.map((i) => `<tr><td style="padding:4px 0;font-size:14px;color:#0f172a">${i.quantity} × ${esc(i.product_name)}</td><td style="padding:4px 0;font-size:14px;text-align:right;color:#0f172a">${cop.format(i.line_total)}</td></tr>`).join("");
  const body = `<div style="margin-top:16px;border-top:1px solid #e2e8f0;padding-top:12px">
    <table style="width:100%;border-collapse:collapse">${list}
      <tr><td style="padding:4px 0;font-size:13px;color:#64748b">Envío · ${esc(order.shipping_zone_name)}</td><td style="padding:4px 0;font-size:13px;color:#64748b;text-align:right">${esc(money(order.shipping_cost))}</td></tr>
      <tr><td style="padding:8px 0;font-size:16px;font-weight:700">Total</td><td style="padding:8px 0;font-size:16px;font-weight:700;text-align:right">${cop.format(order.total)}</td></tr>
    </table>
    ${order.notes ? `<p style="background:#f1f5f9;border-radius:10px;padding:10px 12px;color:#334155;font-size:13px">“${esc(order.notes)}”</p>` : ""}
  </div>`;
  const greeting = storeToCustomerOrderMessage({
    firstName: order.customer_name.split(" ")[0],
    reference: order.reference,
    items: items.map((i) => ({ name: i.product_name, quantity: i.quantity })),
    total: order.total,
    paid,
    shippingPending: order.shipping_cost === null,
  });
  const html = layout({
    eyebrow: paid ? "Pago aprobado" : "Pedido nuevo",
    title: paid ? `Pedido #${order.order_number} pagado` : `Pedido #${order.order_number} por WhatsApp`,
    rows: [
      ["Cliente", esc(order.customer_name)],
      ["Celular", esc(order.customer_phone)],
      ...(order.customer_email ? ([["Correo", esc(order.customer_email)]] as [string, string][]) : []),
      ["Entrega", esc([order.address, order.city].filter(Boolean).join(", "))],
      ["Pago", paid ? "En línea (Wompi) · <span style='color:#16a34a'>Aprobado</span>" : "Por coordinar en WhatsApp"],
      ["Código", esc(order.reference)],
      ...(paid && order.shipping_cost === null
        ? ([["Envío", "<span style='color:#d97706'>Pendiente por coordinar con el cliente (no incluido en el pago)</span>"]] as [string, string][])
        : []),
    ],
    body,
    buttons: [
      { label: "Ver en el panel", href: `${siteUrl()}/admin/orders/${order.id}`, color: "#e9f205" },
      { label: "Escribir al cliente", href: waUrl(order.customer_phone, greeting), color: "#25D366" },
    ],
  });
  const text = [
    paid ? `Pago aprobado · Pedido #${order.order_number}` : `Pedido nuevo #${order.order_number} (WhatsApp)`,
    ...items.map((i) => `- ${i.quantity} × ${i.product_name}: ${cop.format(i.line_total)}`),
    `Envío (${order.shipping_zone_name}): ${money(order.shipping_cost)}`,
    `Total: ${cop.format(order.total)}`,
    `Cliente: ${order.customer_name} · ${order.customer_phone}`,
    `Entrega: ${[order.address, order.city].filter(Boolean).join(", ")}`,
    `Código: ${order.reference}`,
    `Panel: ${siteUrl()}/admin/orders/${order.id}`,
  ].join("\n");
  return {
    subject: paid ? `✅ Pago aprobado · Pedido #${order.order_number} · ${cop.format(order.total)}` : `🛒 Pedido nuevo #${order.order_number} · ${cop.format(order.total)} · WhatsApp`,
    html,
    text,
    replyTo: order.customer_email ?? undefined,
  };
}

/** A WhatsApp order was just placed. */
export async function notifyNewOrder(orderId: string) {
  try {
    const order = await loadOrder({ id: orderId });
    if (order) await send("orders", `order-created/${order.id}`, orderMail(order, false));
  } catch (e) {
    console.error("[notify] new order:", e instanceof Error ? e.message : e);
  }
}

/** An online payment was approved by Wompi (called once per transaction). */
export async function notifyPaidOrder(reference: string) {
  try {
    const order = await loadOrder({ reference });
    if (order && order.payment_status === "approved") await send("orders", `order-paid/${order.id}`, orderMail(order, true));
  } catch (e) {
    console.error("[notify] paid order:", e instanceof Error ? e.message : e);
  }
}

// ── Bookings ─────────────────────────────────────────────────────────────

/** A customer requested a visit from /agendar. */
export async function notifyNewBooking(bookingId: string) {
  try {
    const { data: b } = await createAdminClient()
      .from("bookings")
      .select("id, reference, status, service_slug, starts_at, ends_at, customer_name, customer_phone, customer_email, city, address, notes")
      .eq("id", bookingId)
      .maybeSingle();
    if (!b) return;
    const service = getService(b.service_slug)?.name ?? b.service_slug;
    const day = when(b.starts_at, { weekday: "long", day: "numeric", month: "long" });
    const hours = `${when(b.starts_at, { hour: "numeric", minute: "2-digit" })} – ${when(b.ends_at, { hour: "numeric", minute: "2-digit" })}`;
    const confirm = [
      `Hola, ${b.customer_name.split(" ")[0]} 👋 Te escribimos de INNOVA Seguridad y Sistemas para confirmar tu visita técnica:`,
      "",
      `🔧 Servicio: ${service}`,
      `📅 Fecha: ${day.charAt(0).toUpperCase()}${day.slice(1)}`,
      `🕑 Hora: ${hours}`,
      `📍 Dirección: ${[b.address, b.city].filter(Boolean).join(", ")}`,
      "",
      `🧾 Código de la cita: ${b.reference}`,
    ].join("\n");
    const pending = b.status === "pending";

    const html = layout({
      eyebrow: pending ? "Cita por confirmar" : "Cita agendada",
      title: `${service} · ${day.charAt(0).toUpperCase()}${day.slice(1)}`,
      rows: [
        ["Hora", esc(hours)],
        ["Cliente", esc(b.customer_name)],
        ["Celular", esc(b.customer_phone)],
        ...(b.customer_email ? ([["Correo", esc(b.customer_email)]] as [string, string][]) : []),
        ["Dirección", esc([b.address, b.city].filter(Boolean).join(", "))],
        ["Estado", pending ? "<span style='color:#d97706'>Por confirmar</span>" : "Confirmada"],
        ["Código", esc(b.reference)],
      ],
      body: b.notes ? `<p style="background:#f1f5f9;border-radius:10px;padding:10px 12px;color:#334155;font-size:13px;margin-top:14px">“${esc(b.notes)}”</p>` : undefined,
      buttons: [
        { label: pending ? "Confirmar por WhatsApp" : "Escribir al cliente", href: waUrl(b.customer_phone, confirm), color: "#25D366" },
        { label: "Ver la agenda", href: `${siteUrl()}/admin/bookings`, color: "#e9f205" },
      ],
    });
    const text = [
      `${pending ? "Cita por confirmar" : "Cita agendada"}: ${service}`,
      `${day}, ${hours}`,
      `Cliente: ${b.customer_name} · ${b.customer_phone}`,
      `📍 Dirección: ${[b.address, b.city].filter(Boolean).join(", ")}`,
      ...(b.notes ? [`Notas: ${b.notes}`] : []),
      `Código: ${b.reference}`,
      `Agenda: ${siteUrl()}/admin/bookings`,
    ].join("\n");

    await send("bookings", `booking-created/${b.id}`, {
      subject: `📅 ${pending ? "Cita por confirmar" : "Cita agendada"} · ${service} · ${day} ${when(b.starts_at, { hour: "numeric", minute: "2-digit" })}`,
      html,
      text,
      replyTo: b.customer_email ?? undefined,
    });
  } catch (e) {
    console.error("[notify] new booking:", e instanceof Error ? e.message : e);
  }
}
