import { formatPrice } from "@/lib/shop/format";
import { itemLines } from "@/lib/whatsapp";

type Item = { name: string; quantity: number };

/** Customer → store after an approved online payment. */
export function paidOrderMessage(o: { reference: string; items?: Item[]; total?: number; shippingPending?: boolean }) {
  return [
    "Hola, INNOVA 👋 Acabo de pagar en línea mi pedido ✅",
    ...(o.items?.length ? ["", ...itemLines(o.items)] : []),
    ...(o.total !== undefined ? ["", `✅ Total pagado: ${formatPrice(o.total)}`] : []),
    "",
    `🧾 Código del pedido: ${o.reference}`,
    "",
    o.shippingPending ? "Quedo atento(a) para coordinar el envío." : "Quedo atento(a) para coordinar la entrega.",
  ].join("\n");
}

/** Store → customer, from the admin panel or the e-mail alert. */
export function storeToCustomerOrderMessage(o: { firstName: string; reference: string; items: Item[]; total: number; paid: boolean; shippingPending: boolean }) {
  return [
    `Hola, ${o.firstName} 👋 Te escribimos de INNOVA Seguridad y Sistemas sobre tu pedido:`,
    "",
    ...itemLines(o.items),
    "",
    `💰 Total: ${formatPrice(o.total)}${o.shippingPending ? " + envío" : ""}${o.paid ? " (pagado)" : ""}`,
    `🧾 Código del pedido: ${o.reference}`,
  ].join("\n");
}
