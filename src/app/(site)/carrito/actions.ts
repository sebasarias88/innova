"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProductsByIds, getShippingOptions, getSiteSettings } from "@/lib/shop/queries";
import { formatPrice, shippingLabel } from "@/lib/shop/format";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { checkoutUrl, wompiConfig } from "@/lib/payments/wompi";
import { siteUrl } from "@/lib/site-url";
import { ORDER_COOKIE } from "@/lib/payments/cookie";

z.config(z.locales.es());

/** Current data for the products in the visitor's cart (published ones only). */
export async function refreshCart(ids: unknown) {
  const parsed = z.array(z.uuid()).max(50).safeParse(ids);
  if (!parsed.success) return [];
  const products = await getProductsByIds(parsed.data);
  return products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: p.price, image: p.image, isAvailable: p.isAvailable }));
}

const phone = z
  .string()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .refine((v) => /^\+?[0-9]{7,15}$/.test(v), "Escribe un celular válido, por ejemplo 300 123 4567.");

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(3, "Escribe tu nombre completo.").max(120),
    phone,
    email: z.union([z.literal(""), z.email("Correo no válido.").max(160)]).optional(),
    document: z.string().trim().max(20).optional(),
    city: z.string().trim().min(2, "Escribe tu ciudad.").max(80),
    address: z.string().trim().max(200).optional(),
    notes: z.string().trim().max(500).optional(),
  }),
  items: z
    .array(z.object({ productId: z.uuid(), qty: z.number().int().min(1).max(99) }))
    .min(1, "Tu carrito está vacío.")
    .max(30),
  shippingZoneId: z.uuid("Elige cómo quieres recibir tu pedido."),
  paymentMethod: z.enum(["whatsapp", "wompi"]),
  /** Honeypot: humans never fill this hidden field. */
  website: z.string().max(0).optional(),
});

export type PlaceOrderResult =
  | { ok: true; kind: "whatsapp" | "wompi"; redirectUrl: string }
  | { ok: false; error: string; refresh?: boolean };

const DB_ERRORS: Record<string, string> = {
  product_unavailable: "Uno de los productos ya no está disponible. Revisamos tu carrito, inténtalo de nuevo.",
  invalid_shipping_zone: "Esa opción de envío ya no está disponible. Elige otra.",
  address_required: "Escribe la dirección de entrega.",
  invalid_quantity: "Revisa las cantidades del carrito.",
  invalid_items_count: "Revisa los productos del carrito.",
};

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del pedido." };
  const { customer, items, shippingZoneId, paymentMethod, website } = parsed.data;
  if (website) return { ok: false, error: "No se pudo enviar el pedido." };

  const ip = await getClientIp();
  const [ipOk, phoneOk] = await Promise.all([
    rateLimit(`order:ip:${ip}`, 6, 60 * 60),
    rateLimit(`order:phone:${customer.phone}`, 4, 60 * 60),
  ]);
  if (!ipOk || !phoneOk) return { ok: false, error: "Recibimos varios pedidos seguidos. Espera un momento o escríbenos por WhatsApp." };

  // Online payment needs a fixed amount: "a convenir" shipping is arranged by WhatsApp.
  const wompi = paymentMethod === "wompi" ? wompiConfig() : null;
  if (paymentMethod === "wompi") {
    if (!wompi) return { ok: false, error: "El pago en línea no está disponible ahora. Envía tu pedido por WhatsApp." };
    const zone = (await getShippingOptions()).find((z) => z.id === shippingZoneId);
    if (!zone) return { ok: false, error: DB_ERRORS.invalid_shipping_zone };
    if (zone.price === null) return { ok: false, error: "Para pagar en línea elige un envío con valor fijo, o envía el pedido por WhatsApp." };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("create_order", {
    p_customer: customer,
    p_items: items.map((i) => ({ product_id: i.productId, quantity: i.qty })),
    p_shipping_zone_id: shippingZoneId,
    p_payment_method: paymentMethod,
  });
  if (error || !data) {
    const known = Object.keys(DB_ERRORS).find((k) => error?.message.includes(k));
    if (!known) console.error("[placeOrder]", error?.code, error?.message);
    return { ok: false, error: known ? DB_ERRORS[known] : "No pudimos registrar el pedido. Inténtalo de nuevo.", refresh: known === "product_unavailable" };
  }

  const order = data as { id: string; reference: string; subtotal: number; shipping_cost: number | null; total: number; amount_in_cents: number };

  if (wompi) {
    // Lets the return page show the order details only to the browser that placed it.
    (await cookies()).set(ORDER_COOKIE, order.reference, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 6 });
    return {
      ok: true,
      kind: "wompi",
      redirectUrl: checkoutUrl(wompi, { reference: order.reference, amountInCents: order.amount_in_cents, redirectUrl: `${siteUrl()}/pago` }),
    };
  }

  const [{ data: lines }, settings] = await Promise.all([
    supabase.from("order_items").select("product_name, quantity, line_total").eq("order_id", order.id),
    getSiteSettings(),
  ]);
  const { data: zone } = await supabase.from("orders").select("shipping_zone_name").eq("id", order.id).single();

  const message = [
    "Hola INNOVA 👋 Quiero hacer este pedido de la tienda:",
    "",
    ...(lines ?? []).map((l) => `• ${l.quantity} × ${l.product_name} — ${formatPrice(l.line_total)}`),
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Envío (${zone?.shipping_zone_name ?? "—"}): ${shippingLabel(order.shipping_cost)}`,
    `*Total: ${formatPrice(order.total)}${order.shipping_cost === null ? " + envío" : ""}*`,
    "",
    `👤 ${customer.name}`,
    `📞 ${customer.phone}`,
    customer.address ? `📍 ${customer.address}, ${customer.city}` : `📍 ${customer.city}`,
    ...(customer.notes ? [`📝 ${customer.notes}`] : []),
    "",
    // Code (not the sequential number) so the store can find the order in the panel.
    `Código: ${order.reference}`,
  ].join("\n");

  const whatsapp = settings?.whatsapp ?? "573218539336";
  return { ok: true, kind: "whatsapp", redirectUrl: `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` };
}
