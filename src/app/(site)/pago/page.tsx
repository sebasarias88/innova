import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CircleAlert, CircleCheck, Clock3, SearchX } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { formatPrice, shippingLabel } from "@/lib/shop/format";
import { ORDER_COOKIE } from "@/lib/payments/cookie";
import { applyTransaction, getOrderByReference, type PublicOrder } from "@/lib/payments/orders";
import { fetchTransaction, isTransactionId, wompiConfig } from "@/lib/payments/wompi";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { getSiteSettings } from "@/lib/shop/queries";
import { site } from "@/lib/site";
import { ClearCart, RefreshWhilePending } from "./PaymentClient";

export const metadata: Metadata = {
  title: "Estado del pago",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type View = "approved" | "pending" | "failed" | "not_found";

/**
 * Return page from Wompi (`/pago?id=<transaction id>`). The status is read from
 * Wompi's API — never from the URL — and saved to the order (idempotent), so the
 * order is updated even if the webhook arrives late.
 */
export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const config = wompiConfig();

  let view: View = "not_found";
  let order: PublicOrder | null = null;
  let reference: string | null = null;

  if (config && isTransactionId(id) && (await rateLimit(`pay-return:${await getClientIp()}`, 40, 10 * 60))) {
    const found = await fetchTransaction(config, id);
    if (found) {
      reference = found.tx.reference;
      await applyTransaction(found.tx, "transaction.verified", found.raw);
      order = await getOrderByReference(found.tx.reference);
      if (order) {
        const status = found.tx.status.toUpperCase();
        view = status === "APPROVED" ? "approved" : status === "PENDING" ? "pending" : "failed";
        // The DB is final: e.g. an amount mismatch keeps the order unpaid.
        if (view === "approved" && order.payment_status !== "approved") view = "failed";
      }
    }
  }

  // Order details only for the browser that placed the order.
  const owner = reference !== null && (await cookies()).get(ORDER_COOKIE)?.value === reference;
  const settings = await getSiteSettings();
  const whatsapp = settings?.whatsapp ?? site.phone.raw;
  const wa = (text: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <section className="pb-20 pt-28 sm:pb-28 sm:pt-36">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {view === "approved" && reference && <ClearCart reference={reference} />}
        {view === "pending" && <RefreshWhilePending />}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-10">
          <StatusIcon view={view} />
          <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">{TITLES[view]}</h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-white/70">{TEXTS[view]}</p>
          {reference && view !== "not_found" && (
            <p className="mt-5 font-mono text-sm text-white/50">
              Código del pedido: <span className="text-white">{reference}</span>
            </p>
          )}

          {order && owner && (
            <dl className="mx-auto mt-8 max-w-md space-y-2 border-t border-white/10 pt-6 text-left text-sm">
              {order.items.map((i) => (
                <div key={i.name} className="flex justify-between gap-4 text-white/75">
                  <dt>
                    {i.quantity} × {i.name}
                  </dt>
                  <dd className="shrink-0 font-mono">{formatPrice(i.line_total)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 text-white/60">
                <dt>Envío · {order.shipping_zone_name}</dt>
                <dd className="font-mono">{shippingLabel(order.shipping_cost)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-base font-bold text-white">
                <dt>Total</dt>
                <dd className="font-mono">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          )}

          <div className="mt-9 flex flex-col items-center gap-3">
            {view === "approved" && reference && (
              <a
                href={wa(`Hola INNOVA 👋 Acabo de pagar mi pedido en línea.\nCódigo: ${reference}`)}
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 font-semibold text-navy-950 hover:brightness-110"
              >
                <WhatsAppIcon className="size-5" /> Coordinar la entrega
              </a>
            )}
            {view === "failed" && (
              <Link href="/carrito" className="inline-flex rounded-full bg-lime-400 px-7 py-3.5 font-semibold text-navy-900 hover:bg-white">
                Volver al carrito e intentar de nuevo
              </Link>
            )}
            {(view === "failed" || view === "pending" || view === "not_found") && (
              <a
                href={wa(reference ? `Hola INNOVA 👋 Tengo una duda con el pago de mi pedido.\nCódigo: ${reference}` : "Hola INNOVA 👋 Tengo una duda con un pago en la tienda.")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"
              >
                <WhatsAppIcon className="size-4" /> Escríbenos por WhatsApp
              </a>
            )}
            <Link href="/tienda" className="text-sm font-semibold text-white/50 hover:text-white">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const TITLES: Record<View, string> = {
  approved: "¡Pago aprobado!",
  pending: "Estamos confirmando tu pago",
  failed: "El pago no se completó",
  not_found: "No encontramos este pago",
};

const TEXTS: Record<View, string> = {
  approved: "Recibimos tu pago y ya estamos preparando tu pedido. Te contactaremos para coordinar la entrega.",
  pending: "Tu banco aún no confirma la transacción. Esta página se actualiza sola; no cierres ni pagues de nuevo.",
  failed: "No se realizó ningún cobro. Los productos siguen en tu carrito para que lo intentes otra vez o elijas otro medio de pago.",
  not_found: "Si acabas de pagar, espera unos segundos y recarga la página. Si el problema sigue, escríbenos.",
};

function StatusIcon({ view }: { view: View }) {
  const map = {
    approved: { Icon: CircleCheck, className: "bg-lime-400 text-navy-900" },
    pending: { Icon: Clock3, className: "bg-royal-500/20 text-royal-300" },
    failed: { Icon: CircleAlert, className: "bg-red-500/15 text-red-300" },
    not_found: { Icon: SearchX, className: "bg-white/10 text-white/60" },
  }[view];
  return (
    <span className={`mx-auto grid size-16 place-items-center rounded-full ${map.className}`}>
      <map.Icon className="size-8" />
    </span>
  );
}
