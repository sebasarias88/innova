"use server";

import { cookies } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCartLines, getSiteSettings } from "@/lib/shop/queries";
import { formatPrice, shippingLabel } from "@/lib/shop/format";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { checkoutUrl, wompiConfig } from "@/lib/payments/wompi";
import { siteUrl } from "@/lib/site-url";
import { ORDER_COOKIE } from "@/lib/payments/cookie";
import { legal } from "@/lib/legal";
import { waUrl } from "@/lib/whatsapp";
import { notifyNewOrder } from "@/lib/notifications";

z.config(z.locales.es());

const line = z.object({ productId: z.uuid(), variantId: z.uuid().nullable() });

/** Current data for the lines in the visitor's cart (published products only). */
export async function refreshCart(lines: unknown) {
  const parsed = z.array(line).max(50).safeParse(lines);
  if (!parsed.success) return [];
  const fresh = await getCartLines(parsed.data);
  return fresh.map((l) => ({
    key: l.variantId ? `${l.productId}:${l.variantId}` : l.productId,
    name: l.name,
    variantName: l.variantName,
    slug: l.slug,
    price: l.price,
    image: l.image,
    isAvailable: l.isAvailable,
  }));
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
    .array(z.object({ productId: z.uuid(), variantId: z.uuid().nullable().optional(), qty: z.number().int().min(1).max(99) }))
    .min(1, "Tu carrito está vacío.")
    .max(30),
  shippingZoneId: z.uuid("Elige cómo quieres recibir tu pedido."),
  paymentMethod: z.enum(["whatsapp", "wompi"]),
  /** Authorization for personal data (Ley 1581); its version is stored with the order. */
  acceptPrivacy: z.literal(true, "Para continuar, autoriza el tratamiento de tus datos y acepta los términos."),
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

  // With "a convenir" shipping the online payment covers only the products; the
  // order keeps shipping_cost = null and the shipping is arranged by WhatsApp.
  const wompi = paymentMethod === "wompi" ? wompiConfig() : null;
  if (paymentMethod === "wompi" && !wompi) return { ok: false, error: "El pago en línea no está disponible ahora. Envía tu pedido por WhatsApp." };

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("create_order", {
    p_customer: { ...customer, privacy_version: legal.version },
    p_items: items.map((i) => ({ product_id: i.productId, variant_id: i.variantId ?? null, quantity: i.qty })),
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

  // Online orders are announced when the payment is approved (see applyTransaction).
  after(() => notifyNewOrder(order.id));

  const message = [
    "Hola, INNOVA 👋 Quisiera realizar el siguiente pedido desde la tienda en línea:",
    "",
    "🛒 *Productos*",
    ...(lines ?? []).map((l) => `- ${l.quantity} x ${l.product_name}: ${formatPrice(l.line_total)}`),
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Envío (${zone?.shipping_zone_name ?? "por definir"}): ${order.shipping_cost === null ? "por definir" : shippingLabel(order.shipping_cost)}`,
    `💰 *Total: ${formatPrice(order.total)}${order.shipping_cost === null ? " + envío" : ""}*`,
    "",
    "🚚 *Datos de entrega*",
    `Nombre: ${customer.name}`,
    `Celular: ${customer.phone}`,
    customer.address ? `Dirección: ${customer.address}, ${customer.city}` : `Ciudad: ${customer.city}`,
    ...(customer.notes ? [`Notas: ${customer.notes}`] : []),
    "",
    // Code (not the sequential number) so the store can find the order in the panel.
    `🧾 Código del pedido: ${order.reference}`,
  ].join("\n");

  const whatsapp = settings?.whatsapp ?? "573218539336";
  return { ok: true, kind: "whatsapp", redirectUrl: waUrl(whatsapp, message) };
}
