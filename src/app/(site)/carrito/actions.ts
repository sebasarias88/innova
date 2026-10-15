"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProductsByIds, getSiteSettings } from "@/lib/shop/queries";
import { formatPrice, shippingLabel } from "@/lib/shop/format";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

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
  paymentMethod: z.literal("whatsapp"),
  /** Honeypot: humans never fill this hidden field. */
  website: z.string().max(0).optional(),
});

export type PlaceOrderResult =
  | { ok: true; orderNumber: number; whatsappUrl: string }
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

  const order = data as { id: string; order_number: number; reference: string; subtotal: number; shipping_cost: number | null; total: number };
  const [{ data: lines }, settings] = await Promise.all([
    supabase.from("order_items").select("product_name, quantity, line_total").eq("order_id", order.id),
    getSiteSettings(),
  ]);
  const { data: zone } = await supabase.from("orders").select("shipping_zone_name").eq("id", order.id).single();

  const message = [
    `Hola INNOVA 👋 Acabo de hacer el pedido *#${order.order_number}* en la tienda:`,
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
    `Ref: ${order.reference}`,
  ].join("\n");

  const whatsapp = settings?.whatsapp ?? "573218539336";
  return { ok: true, orderNumber: order.order_number, whatsappUrl: `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` };
}
