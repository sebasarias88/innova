"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CreditCard, ImageOff, LoaderCircle, Lock, MapPin, Minus, Plus, ShoppingBag, Store, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { cart, paidOrder, useCart, type CartItem } from "@/lib/shop/cart";
import { formatPrice, shippingLabel } from "@/lib/shop/format";
import type { ShippingOption } from "@/lib/shop/queries";
import { placeOrder, refreshCart } from "./actions";

const noopSubscribe = () => () => {};

const STEPS = ["Carrito", "Envío y datos", "Confirmar"] as const;

type PaymentMethod = "whatsapp" | "wompi";

type Customer = { name: string; phone: string; email: string; document: string; city: string; address: string; notes: string };

export function Checkout({
  shipping,
  onlinePayments,
  paidReference,
  whatsapp,
}: {
  shipping: ShippingOption[];
  onlinePayments: boolean;
  /** Last online order of this browser, when its payment is already approved. */
  paidReference: string | null;
  whatsapp: string;
}) {
  const items = useCart();
  const [step, setStep] = useState(0);
  const [zoneId, setZoneId] = useState<string>(shipping[0]?.id ?? "");
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", email: "", document: "", city: "Armenia", address: "", notes: "" });
  const [method, setMethod] = useState<PaymentMethod>(onlinePayments ? "wompi" : "whatsapp");
  const [redirect, setRedirect] = useState<{ kind: PaymentMethod; url: string } | null>(null);
  const [pending, start] = useTransition();
  // False while server-rendering (the cart lives in the browser), true afterwards.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const top = useRef<HTMLDivElement>(null);
  // Read once on load (client only): show the "already paid" notice the first time.
  const [justPaid] = useState(() => (paidReference && typeof window !== "undefined" && !paidOrder.isHandled(paidReference) ? paidReference : null));

  useEffect(() => {
    if (!justPaid) return;
    cart.clear();
    paidOrder.markHandled(justPaid);
  }, [justPaid]);

  // Coming back with the browser's back button restores this page from memory with
  // the old "opening…" screen: reload it so the cart and payment state are fresh.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const zone = shipping.find((z) => z.id === zoneId);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + (zone?.price ?? 0);
  // Online payment needs a fixed amount ("a convenir" shipping is arranged by WhatsApp).
  const canPayOnline = onlinePayments && zone?.price !== null && zone !== undefined;
  const payment: PaymentMethod = method === "wompi" && canPayOnline ? "wompi" : "whatsapp";
  const units = items.reduce((n, i) => n + i.qty, 0);

  // Refresh names, prices and availability from the server when the cart opens.
  useEffect(() => {
    const ids = cart.ids();
    if (!ids.length) return;
    refreshCart(ids).then((fresh) => {
      const before = cart.ids().length;
      const sellable = fresh.filter((p) => p.isAvailable);
      cart.sync(sellable);
      if (cart.ids().length < before) toast.warning("Quitamos del carrito productos que ya no están disponibles.");
    });
  }, []);

  const goTo = (s: number) => {
    setStep(s);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validateDetails = () => {
    if (!zone) return "Elige cómo quieres recibir tu pedido.";
    if (customer.name.trim().length < 3) return "Escribe tu nombre completo.";
    if (!/^\+?[0-9]{7,15}$/.test(customer.phone.replace(/[\s\-().]/g, ""))) return "Escribe un celular válido, por ejemplo 300 123 4567.";
    if (customer.city.trim().length < 2) return "Escribe tu ciudad.";
    if (!zone.isPickup && customer.address.trim().length < 5) return "Escribe la dirección de entrega.";
    if (customer.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) return "Revisa el correo electrónico.";
    return null;
  };

  const submit = (honeypot: string) =>
    start(async () => {
      const result = await placeOrder({
        customer: { ...customer, address: zone?.isPickup ? "" : customer.address },
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        shippingZoneId: zoneId,
        paymentMethod: payment,
        website: honeypot,
      });
      if (!result.ok) {
        toast.error(result.error);
        if (result.refresh) {
          const fresh = await refreshCart(cart.ids());
          cart.sync(fresh.filter((p) => p.isAvailable));
          goTo(0);
        }
        return;
      }
      // WhatsApp: the order is already written in the message. Wompi: the cart is kept
      // until the payment is approved, so a declined card can try again.
      if (result.kind === "whatsapp") cart.clear();
      setRedirect({ kind: result.kind, url: result.redirectUrl });
      // Straight to WhatsApp / the payment page; the fallback below covers blocked redirects.
      window.location.assign(result.redirectUrl);
    });

  if (redirect) return <Redirecting kind={redirect.kind} url={redirect.url} />;
  if (!hydrated) return <div className="h-96" />;
  if (justPaid) return <PaidNotice reference={justPaid} whatsapp={whatsapp} />;
  if (!items.length) return <EmptyCart />;

  return (
    <div ref={top} className="scroll-mt-28">
      <Stepper step={step} onStep={(s) => s < step && goTo(s)} />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              {step === 0 && <CartStep items={items} />}
              {step === 1 && <DetailsStep shipping={shipping} zoneId={zoneId} setZoneId={setZoneId} customer={customer} setCustomer={setCustomer} />}
              {step === 2 && zone && (
                <ReviewStep items={items} customer={customer} zone={zone} onEdit={goTo} onlinePayments={onlinePayments} canPayOnline={canPayOnline} payment={payment} setMethod={setMethod} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-bold text-white">Resumen</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-white/70">
              <dt>
                Subtotal ({units} {units === 1 ? "producto" : "productos"})
              </dt>
              <dd className="font-mono">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-white/70">
              <dt>Envío{zone && step > 0 ? ` · ${zone.name}` : ""}</dt>
              <dd className="font-mono">{step > 0 && zone ? shippingLabel(zone.price) : "Se calcula después"}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
              <dt>Total</dt>
              <dd className="font-mono">
                {formatPrice(step > 0 ? total : subtotal)}
                {step > 0 && zone?.price === null && <span className="block text-right text-[11px] font-normal text-white/50">+ envío a convenir</span>}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-white/40">Precios finales en pesos colombianos.</p>

          <div className="mt-6 space-y-2">
            {step === 0 && (
              <PrimaryButton onClick={() => goTo(1)}>
                Continuar <ArrowRight className="size-4" />
              </PrimaryButton>
            )}
            {step === 1 && (
              <PrimaryButton
                onClick={() => {
                  const error = validateDetails();
                  if (error) return toast.error(error);
                  goTo(2);
                }}
              >
                Revisar pedido <ArrowRight className="size-4" />
              </PrimaryButton>
            )}
            {step === 2 && <SubmitOrder pending={pending} onSubmit={submit} payment={payment} total={total} />}
            {step > 0 && (
              <button type="button" onClick={() => goTo(step - 1)} className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-white/60 hover:text-white">
                <ArrowLeft className="size-4" /> Volver
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Steps ───────────────────────────────────────────────────────────────

function Stepper({ step, onStep }: { step: number; onStep: (s: number) => void }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onStep(i)}
            disabled={i >= step}
            className={clsx(
              "flex items-center gap-2 text-left text-sm font-semibold transition-colors",
              i === step ? "text-white" : i < step ? "text-lime-400 hover:text-lime-300" : "text-white/35",
            )}
          >
            <span
              className={clsx(
                "grid size-8 shrink-0 place-items-center rounded-full border text-xs",
                i < step ? "border-lime-400 bg-lime-400 text-navy-900" : i === step ? "border-white text-white" : "border-white/20",
              )}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={clsx(i !== step && "hidden sm:inline")}>{label}</span>
          </button>
          {i < STEPS.length - 1 && <span className={clsx("h-px flex-1", i < step ? "bg-lime-400/60" : "bg-white/15")} />}
        </li>
      ))}
    </ol>
  );
}

function CartStep({ items }: { items: CartItem[] }) {
  return (
    <ul className="divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      {items.map((item) => (
        <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
          <Link href={`/tienda/${item.slug}`} className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white sm:size-24">
            {item.image ? <img src={item.image} alt="" className="size-full object-contain p-2" /> : <ImageOff className="size-6 text-navy-900/30" />}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/tienda/${item.slug}`} className="line-clamp-2 font-semibold leading-snug text-white hover:text-lime-300">
                {item.name}
              </Link>
              <button type="button" aria-label={`Quitar ${item.name}`} onClick={() => cart.remove(item.productId)} className="shrink-0 text-white/40 hover:text-red-300">
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-white/50">{formatPrice(item.price)} c/u</p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-3">
              <div className="flex items-center rounded-full border border-white/15">
                <button type="button" aria-label="Quitar uno" onClick={() => cart.setQty(item.productId, item.qty - 1)} className="grid size-9 place-items-center text-white/70 hover:text-white">
                  <Minus className="size-3.5" />
                </button>
                <span className="w-7 text-center font-mono text-sm">{item.qty}</span>
                <button type="button" aria-label="Agregar uno" onClick={() => cart.setQty(item.productId, item.qty + 1)} className="grid size-9 place-items-center text-white/70 hover:text-white">
                  <Plus className="size-3.5" />
                </button>
              </div>
              <p className="font-mono font-semibold text-white">{formatPrice(item.price * item.qty)}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

const input =
  "mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 focus:border-lime-400 focus:outline-none";

function DetailsStep({
  shipping,
  zoneId,
  setZoneId,
  customer,
  setCustomer,
}: {
  shipping: ShippingOption[];
  zoneId: string;
  setZoneId: (id: string) => void;
  customer: Customer;
  setCustomer: (c: Customer) => void;
}) {
  const zone = shipping.find((z) => z.id === zoneId);
  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCustomer({ ...customer, [k]: e.target.value });

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-bold text-white">¿Cómo quieres recibirlo?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {shipping.map((z) => (
            <label
              key={z.id}
              className={clsx(
                "flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors",
                z.id === zoneId ? "border-lime-400 bg-lime-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/25",
              )}
            >
              <input type="radio" name="zone" value={z.id} checked={z.id === zoneId} onChange={() => setZoneId(z.id)} className="sr-only" />
              <span className={clsx("grid size-10 shrink-0 place-items-center rounded-xl", z.id === zoneId ? "bg-lime-400 text-navy-900" : "bg-white/5 text-royal-300")}>
                {z.isPickup ? <Store className="size-5" /> : <Truck className="size-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-white">{z.name}</span>
                  <span className={clsx("shrink-0 text-sm font-bold", z.price === 0 ? "text-lime-400" : "text-white")}>{shippingLabel(z.price)}</span>
                </span>
                {z.description && <span className="mt-0.5 block text-xs leading-snug text-white/55">{z.description}</span>}
              </span>
            </label>
          ))}
        </div>
        {zone?.price === null && (
          <p className="mt-3 rounded-2xl border border-royal-400/30 bg-royal-500/10 px-4 py-3 text-sm text-white/80">
            El valor del envío a tu ciudad lo acordamos contigo por WhatsApp antes de despachar. No pagas nada hasta confirmarlo.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-white">Tus datos</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Label text="Nombre completo *">
            <input className={input} value={customer.name} onChange={set("name")} autoComplete="name" maxLength={120} placeholder="Tu nombre" />
          </Label>
          <Label text="Celular / WhatsApp *">
            <input className={input} value={customer.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" maxLength={20} placeholder="300 123 4567" />
          </Label>
          <Label text="Correo (opcional)">
            <input className={input} value={customer.email} onChange={set("email")} autoComplete="email" type="email" maxLength={160} placeholder="tu@correo.com" />
          </Label>
          <Label text="Cédula o NIT (opcional)">
            <input className={input} value={customer.document} onChange={set("document")} maxLength={20} placeholder="Para la factura" />
          </Label>
          <Label text="Ciudad *">
            <input className={input} value={customer.city} onChange={set("city")} autoComplete="address-level2" maxLength={80} />
          </Label>
          {!zone?.isPickup && (
            <Label text="Dirección de entrega *">
              <input className={input} value={customer.address} onChange={set("address")} autoComplete="street-address" maxLength={200} placeholder="Calle, número, barrio" />
            </Label>
          )}
          <div className="sm:col-span-2">
            <Label text="Notas (opcional)">
              <textarea className={clsx(input, "resize-none")} rows={3} value={customer.notes} onChange={set("notes")} maxLength={500} placeholder="Indicaciones de entrega, horario, si necesitas instalación…" />
            </Label>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReviewStep({
  items,
  customer,
  zone,
  onEdit,
  onlinePayments,
  canPayOnline,
  payment,
  setMethod,
}: {
  items: CartItem[];
  customer: Customer;
  zone: ShippingOption;
  onEdit: (s: number) => void;
  onlinePayments: boolean;
  canPayOnline: boolean;
  payment: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
}) {
  return (
    <div className="space-y-4">
      <ReviewBlock title="Productos" onEdit={() => onEdit(0)}>
        <ul className="space-y-1.5 text-sm text-white/75">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-4">
              <span>
                {i.qty} × {i.name}
              </span>
              <span className="shrink-0 font-mono">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
      </ReviewBlock>
      <ReviewBlock title="Entrega" onEdit={() => onEdit(1)}>
        <p className="flex items-start gap-2 text-sm text-white/75">
          <MapPin className="mt-0.5 size-4 shrink-0 text-lime-400" />
          <span>
            <b className="text-white">{zone.name}</b> · {shippingLabel(zone.price)}
            <br />
            {zone.isPickup ? "Recoges en la tienda." : `${customer.address}, ${customer.city}`}
          </span>
        </p>
        <p className="mt-2 text-sm text-white/60">
          {customer.name} · {customer.phone}
          {customer.email && ` · ${customer.email}`}
        </p>
      </ReviewBlock>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-bold text-white">Método de pago</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Método de pago">
          {onlinePayments && (
            <PaymentOption
              selected={payment === "wompi"}
              disabled={!canPayOnline}
              onSelect={() => setMethod("wompi")}
              icon={<CreditCard className="size-5" />}
              iconClass="bg-lime-400 text-navy-900"
              title="Pagar en línea"
              text={canPayOnline ? "Tarjeta, PSE, Nequi o Bancolombia. Pago seguro con Wompi." : "No disponible con envío a convenir: primero acordamos el valor del envío."}
            />
          )}
          <PaymentOption
            selected={payment === "whatsapp"}
            onSelect={() => setMethod("whatsapp")}
            icon={<WhatsAppIcon className="size-5" />}
            iconClass="bg-[#25D366] text-white"
            title="Coordinar por WhatsApp"
            text="Te confirmamos disponibilidad y pagas por transferencia, Nequi o en tienda."
          />
        </div>
      </section>
    </div>
  );
}

function SubmitOrder({ pending, onSubmit, payment, total }: { pending: boolean; onSubmit: (honeypot: string) => void; payment: PaymentMethod; total: number }) {
  const [honeypot, setHoneypot] = useState("");
  const online = payment === "wompi";
  return (
    <>
      {/* Hidden from people; bots tend to fill every field. */}
      <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />
      <button
        type="button"
        disabled={pending}
        onClick={() => onSubmit(honeypot)}
        className={clsx(
          "flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-navy-950 transition-[filter,background-color] disabled:opacity-60",
          online ? "bg-lime-400 hover:bg-white" : "bg-[#25D366] hover:brightness-110",
        )}
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" /> : online ? <Lock className="size-5" /> : <WhatsAppIcon className="size-5" />}
        {online ? `Pagar ${formatPrice(total)}` : "Enviar pedido por WhatsApp"}
      </button>
      <p className="text-center text-[11px] leading-snug text-white/45">
        {online
          ? "Te llevamos a la página segura de Wompi (Bancolombia) para completar el pago."
          : "Se abrirá WhatsApp con tu pedido listo para enviar. Ahí coordinamos el pago y la entrega."}
      </p>
    </>
  );
}

/** Shown for a moment while WhatsApp / the payment page opens (and as a fallback if it does not). */
function Redirecting({ kind, url }: { kind: PaymentMethod; url: string }) {
  const online = kind === "wompi";
  const [back, setBack] = useState(false);

  // WhatsApp opens in another app/tab: when the customer returns, show that the order is done.
  useEffect(() => {
    if (online) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") setBack(true);
    };
    const timer = setTimeout(() => setBack(true), 4000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [online]);

  if (!online && back) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-lime-400 text-navy-900">
          <Check className="size-8" />
        </span>
        <h2 className="mt-6 text-2xl font-bold text-white">¡Pedido registrado!</h2>
        <p className="mt-3 text-pretty text-white/70">Cuando envíes el mensaje en WhatsApp te confirmamos disponibilidad, pago y entrega.</p>
        <Link href="/tienda" className="mt-8 inline-flex rounded-full bg-lime-400 px-8 py-4 font-semibold text-navy-900 hover:bg-white">
          Seguir comprando
        </Link>
        <p className="mt-5">
          <a href={url} className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white">
            <WhatsAppIcon className="size-4" /> ¿No se envió? Abrir WhatsApp otra vez
          </a>
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center sm:p-12">
      <span className={clsx("mx-auto grid size-16 place-items-center rounded-full", online ? "bg-lime-400 text-navy-900" : "bg-[#25D366] text-white")}>
        {online ? <Lock className="size-8" /> : <WhatsAppIcon className="size-8" />}
      </span>
      <h2 className="mt-6 text-2xl font-bold text-white">{online ? "Abriendo el pago seguro…" : "Abriendo WhatsApp…"}</h2>
      <p className="mt-3 text-pretty text-white/70">
        {online
          ? "Te estamos llevando a Wompi para que completes el pago. Al terminar volverás a esta tienda."
          : "Tu pedido ya está escrito. Solo dale enviar en WhatsApp y te confirmamos disponibilidad, pago y entrega."}
      </p>
      <a
        href={url}
        className={clsx(
          "mt-8 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold text-navy-950",
          online ? "bg-lime-400 hover:bg-white" : "bg-[#25D366] hover:brightness-110",
        )}
      >
        {online ? <Lock className="size-5" /> : <WhatsAppIcon className="size-5" />} Si no se abrió, toca aquí
      </a>
    </motion.div>
  );
}

/** The customer already paid online (came back to the cart after paying). */
function PaidNotice({ reference, whatsapp }: { reference: string; whatsapp: string }) {
  const message = `Hola INNOVA 👋 Acabo de pagar mi pedido en línea.\nCódigo: ${reference}`;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center sm:p-12">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-lime-400 text-navy-900">
        <Check className="size-8" />
      </span>
      <h2 className="mt-6 text-2xl font-bold text-white">¡Tu pago fue aprobado!</h2>
      <p className="mt-3 text-pretty text-white/70">Ya estamos preparando tu pedido y vaciamos tu carrito. Te contactaremos para coordinar la entrega.</p>
      <p className="mt-4 font-mono text-sm text-white/50">
        Código del pedido: <span className="text-white">{reference}</span>
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 font-semibold text-navy-950 hover:brightness-110"
        >
          <WhatsAppIcon className="size-5" /> Coordinar la entrega
        </a>
        <Link href="/tienda" className="text-sm font-semibold text-white/60 hover:text-white">
          Seguir comprando
        </Link>
      </div>
    </motion.div>
  );
}

function EmptyCart() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
      <ShoppingBag className="mx-auto size-12 text-white/25" />
      <h2 className="mt-5 text-2xl font-bold text-white">Tu carrito está vacío</h2>
      <p className="mt-2 text-white/60">Explora la tienda y agrega los equipos que necesitas.</p>
      <Link href="/tienda" className="mt-7 inline-flex rounded-full bg-lime-400 px-7 py-3.5 font-semibold text-navy-900 hover:bg-white">
        Ir a la tienda
      </Link>
    </div>
  );
}

// ── Small pieces ────────────────────────────────────────────────────────

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/50">{text}</span>
      {children}
    </label>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-white">{title}</h3>
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-lime-400 hover:text-white">
          Cambiar
        </button>
      </div>
      {children}
    </section>
  );
}

function PaymentOption({
  selected,
  disabled,
  onSelect,
  icon,
  iconClass,
  title,
  text,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={clsx(
        "flex gap-3 rounded-2xl border p-4 text-left transition-colors",
        selected ? "border-lime-400 bg-lime-400/10" : "border-white/10 hover:border-white/25",
        disabled && "cursor-not-allowed opacity-50 hover:border-white/10",
      )}
    >
      <span className={clsx("grid size-10 shrink-0 place-items-center rounded-xl", iconClass)}>{icon}</span>
      <span>
        <span className="block font-semibold text-white">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-white/60">{text}</span>
      </span>
    </button>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-4 font-semibold text-navy-900 transition-colors hover:bg-white">
      {children}
    </button>
  );
}

