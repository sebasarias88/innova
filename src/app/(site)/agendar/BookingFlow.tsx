"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarCheck, CalendarDays, Check, Clock, LoaderCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { ConsentCheckbox } from "@/components/legal/ConsentCheckbox";
import { newTab, waUrl } from "@/lib/whatsapp";
import { prepareWhatsAppTab } from "@/lib/whatsapp-tab";
import { track } from "@/lib/analytics/client";
import { createBooking, refreshSlots } from "./actions";

type ServiceOption = { slug: string; name: string; short: string; icon: string };
type Slot = { start: string; end: string };
type Customer = { name: string; phone: string; email: string; city: string; address: string; notes: string };

const STEPS = ["Servicio", "Fecha y hora", "Tus datos", "Confirmar"] as const;
const TZ = "America/Bogota";

const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-CO", { timeZone: TZ, ...opts }).format(new Date(iso));
// Colombia reads the 12-hour clock (8:00 a. m. / 2:00 p. m.).
const timeLabel = (iso: string) => fmt(iso, { hour: "numeric", minute: "2-digit", hourCycle: "h12" });
const longDay = (iso: string) => fmt(iso, { weekday: "long", day: "numeric", month: "long" });

export function BookingFlow({
  services,
  initialSlots,
  initialService,
  whatsapp,
}: {
  services: ServiceOption[];
  initialSlots: Slot[];
  initialService: string | null;
  whatsapp: string;
}) {
  const [step, setStep] = useState(initialService ? 1 : 0);
  const [service, setService] = useState<string | null>(initialService);
  const [slots, setSlots] = useState(initialSlots);
  const [day, setDay] = useState<string | null>(initialSlots[0] ? dayKey(initialSlots[0].start) : null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", email: "", city: "Armenia", address: "", notes: "" });
  const [done, setDone] = useState<{ url: string; confirmed: boolean; reference: string; slot: Slot } | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [pending, start] = useTransition();
  const [loadingSlots, startSlots] = useTransition();
  const top = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) map.set(dayKey(s.start), [...(map.get(dayKey(s.start)) ?? []), s]);
    return [...map.entries()];
  }, [slots]);
  const daySlots = days.find(([k]) => k === day)?.[1] ?? [];
  const selectedService = services.find((s) => s.slug === service);

  const goTo = (s: number) => {
    setStep(s);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Fresh availability every time the customer reaches the calendar.
  const loadSlots = (keepSelection = true) =>
    startSlots(async () => {
      const fresh = await refreshSlots();
      setSlots(fresh);
      const stillFree = keepSelection && slot && fresh.some((s) => s.start === slot.start);
      if (!stillFree) setSlot(null);
      if (!fresh.some((s) => dayKey(s.start) === day)) setDay(fresh[0] ? dayKey(fresh[0].start) : null);
    });

  const chooseService = (slug: string) => {
    setService(slug);
    loadSlots();
    goTo(1);
  };

  const validateDetails = () => {
    if (customer.name.trim().length < 3) return "Escribe tu nombre completo.";
    if (!/^\+?[0-9]{7,15}$/.test(customer.phone.replace(/[\s\-().]/g, ""))) return "Escribe un celular válido, por ejemplo 300 123 4567.";
    if (customer.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) return "Revisa el correo electrónico.";
    if (customer.city.trim().length < 2) return "Escribe tu ciudad.";
    if (customer.address.trim().length < 5) return "Escribe la dirección de la visita.";
    return null;
  };

  const submit = (honeypot: string) => {
    if (!service || !slot) return;
    if (!accepted) {
      toast.error("Para continuar, autoriza el tratamiento de tus datos y acepta los términos.");
      return;
    }
    // WhatsApp opens in a new tab on computers (prepared now, during the click).
    const tab = prepareWhatsAppTab();
    start(async () => {
      const result = await createBooking({ service, startsAt: slot.start, customer, acceptPrivacy: accepted, website: honeypot });
      if (!result.ok) {
        tab.cancel();
        toast.error(result.error);
        if (result.slotTaken) {
          loadSlots(false);
          goTo(1);
        }
        return;
      }
      track("booking", service);
      setDone({ url: result.whatsappUrl, confirmed: result.confirmed, reference: result.reference, slot });
      // Booking is already saved: WhatsApp only carries the details to the store.
      tab.go(result.whatsappUrl);
    });
  };

  if (done) return <Booked {...done} />;

  return (
    <div ref={top} className="scroll-mt-28">
      <Stepper step={step} onStep={(s) => s < step && goTo(s)} />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              {step === 0 && <ServiceStep services={services} selected={service} onSelect={chooseService} />}
              {step === 1 && (
                <DateStep days={days} day={day} setDay={setDay} daySlots={daySlots} slot={slot} setSlot={setSlot} loading={loadingSlots} whatsapp={whatsapp} />
              )}
              {step === 2 && <DetailsStep customer={customer} setCustomer={setCustomer} />}
              {step === 3 && selectedService && slot && <ReviewStep service={selectedService} slot={slot} customer={customer} onEdit={goTo} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-bold text-white">Tu cita</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <SummaryRow icon={<Icon name={selectedService?.icon ?? "Wrench"} className="size-4" />} label="Servicio" value={selectedService?.name} />
            <SummaryRow icon={<CalendarDays className="size-4" />} label="Fecha" value={slot ? capitalize(longDay(slot.start)) : undefined} />
            <SummaryRow icon={<Clock className="size-4" />} label="Hora" value={slot ? `${timeLabel(slot.start)} – ${timeLabel(slot.end)}` : undefined} />
          </dl>
          <p className="mt-4 text-xs leading-snug text-white/45">
            Cada visita dura hasta 2 horas, en la dirección que nos indiques. La cita queda confirmada cuando te respondamos por WhatsApp.
          </p>

          <div className="mt-6 space-y-2">
            {step === 0 && (
              <PrimaryButton disabled={!service} onClick={() => chooseService(service!)}>
                Continuar <ArrowRight className="size-4" />
              </PrimaryButton>
            )}
            {step === 1 && (
              <PrimaryButton disabled={!slot} onClick={() => goTo(2)}>
                Continuar <ArrowRight className="size-4" />
              </PrimaryButton>
            )}
            {step === 2 && (
              <PrimaryButton
                onClick={() => {
                  const error = validateDetails();
                  if (error) return toast.error(error);
                  goTo(3);
                }}
              >
                Revisar cita <ArrowRight className="size-4" />
              </PrimaryButton>
            )}
            {step === 3 && (
              <>
                <ConsentCheckbox checked={accepted} onChange={setAccepted} />
                <SubmitBooking pending={pending} onSubmit={submit} />
              </>
            )}
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
        <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3 last:flex-none">
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
            <span className={clsx("whitespace-nowrap", i !== step && "hidden md:inline")}>{label}</span>
          </button>
          {i < STEPS.length - 1 && <span className={clsx("h-px flex-1", i < step ? "bg-lime-400/60" : "bg-white/15")} />}
        </li>
      ))}
    </ol>
  );
}

function ServiceStep({ services, selected, onSelect }: { services: ServiceOption[]; selected: string | null; onSelect: (slug: string) => void }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white">¿Qué servicio necesitas?</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => onSelect(s.slug)}
            className={clsx(
              "group flex gap-4 rounded-2xl border p-4 text-left transition-colors",
              s.slug === selected ? "border-lime-400 bg-lime-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/25",
            )}
          >
            <span
              className={clsx(
                "grid size-11 shrink-0 place-items-center rounded-xl transition-colors",
                s.slug === selected ? "bg-lime-400 text-navy-900" : "bg-royal-500/15 text-royal-300 group-hover:bg-lime-400 group-hover:text-navy-900",
              )}
            >
              <Icon name={s.icon} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-white">{s.name}</span>
              <span className="mt-0.5 block text-sm leading-snug text-white/55">{s.short}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateStep({
  days,
  day,
  setDay,
  daySlots,
  slot,
  setSlot,
  loading,
  whatsapp,
}: {
  days: [string, Slot[]][];
  day: string | null;
  setDay: (d: string) => void;
  daySlots: Slot[];
  slot: Slot | null;
  setSlot: (s: Slot) => void;
  loading: boolean;
  whatsapp: string;
}) {
  if (!days.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 px-6 py-14 text-center">
        {loading ? (
          <LoaderCircle className="mx-auto size-8 animate-spin text-white/40" />
        ) : (
          <>
            <CalendarDays className="mx-auto size-10 text-white/25" />
            <h2 className="mt-4 text-xl font-bold text-white">No hay horarios disponibles por ahora</h2>
            <p className="mx-auto mt-2 max-w-sm text-white/60">Escríbenos y buscamos un espacio para tu visita.</p>
            <a
              href={waUrl(whatsapp, "Hola, INNOVA 👋 Quisiera agendar una visita técnica. ¿Qué disponibilidad tienen?")}
              {...newTab}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-navy-950 hover:brightness-110"
            >
              <WhatsAppIcon className="size-5" /> Escribir por WhatsApp
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Elige el día</h2>
          {loading && <LoaderCircle className="size-4 animate-spin text-white/40" aria-label="Actualizando horarios" />}
        </div>
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0">
          {days.map(([key, list]) => {
            const first = list[0].start;
            const active = key === day;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDay(key)}
                aria-pressed={active}
                className={clsx(
                  "flex w-[4.6rem] shrink-0 flex-col items-center rounded-2xl border px-2 py-3 transition-colors",
                  active ? "border-lime-400 bg-lime-400 text-navy-900" : "border-white/10 bg-white/[0.03] text-white hover:border-white/25",
                )}
              >
                <span className={clsx("text-[11px] font-semibold uppercase", active ? "text-navy-900/70" : "text-white/50")}>{fmt(first, { weekday: "short" }).replace(".", "")}</span>
                <span className="mt-0.5 text-2xl font-bold leading-none">{fmt(first, { day: "numeric" })}</span>
                <span className={clsx("mt-1 text-[11px] uppercase", active ? "text-navy-900/70" : "text-white/50")}>{fmt(first, { month: "short" }).replace(".", "")}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white">Elige la hora</h2>
        {day && <p className="mt-1 text-sm text-white/55 first-letter:uppercase">{longDay(daySlots[0]?.start ?? `${day}T12:00:00-05:00`)}</p>}
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {daySlots.map((s) => {
            const active = slot?.start === s.start;
            return (
              <button
                key={s.start}
                type="button"
                onClick={() => setSlot(s)}
                aria-pressed={active}
                className={clsx(
                  "rounded-xl border px-2 py-3 font-mono text-sm font-semibold transition-colors",
                  active ? "border-lime-400 bg-lime-400 text-navy-900" : "border-white/10 bg-white/[0.03] text-white hover:border-lime-400/60",
                )}
              >
                {timeLabel(s.start)}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const input =
  "mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 focus:border-lime-400 focus:outline-none";

function DetailsStep({ customer, setCustomer }: { customer: Customer; setCustomer: (c: Customer) => void }) {
  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCustomer({ ...customer, [k]: e.target.value });
  return (
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
        <Label text="Ciudad *">
          <input className={input} value={customer.city} onChange={set("city")} autoComplete="address-level2" maxLength={80} />
        </Label>
        <div className="sm:col-span-2">
          <Label text="Dirección de la visita *">
            <input className={input} value={customer.address} onChange={set("address")} autoComplete="street-address" maxLength={200} placeholder="Calle, número, barrio, apto o local" />
          </Label>
        </div>
        <div className="sm:col-span-2">
          <Label text="¿Qué necesitas? (opcional)">
            <textarea
              className={clsx(input, "resize-none")}
              rows={3}
              value={customer.notes}
              onChange={set("notes")}
              maxLength={500}
              placeholder="Ej: instalar 4 cámaras en una casa de dos pisos, revisar un motor de puerta que no abre…"
            />
          </Label>
        </div>
      </div>
    </section>
  );
}

function ReviewStep({ service, slot, customer, onEdit }: { service: ServiceOption; slot: Slot; customer: Customer; onEdit: (s: number) => void }) {
  return (
    <div className="space-y-4">
      <ReviewBlock title="Servicio" onEdit={() => onEdit(0)}>
        <p className="flex items-center gap-2 text-sm text-white/80">
          <Icon name={service.icon} className="size-4 text-lime-400" /> {service.name}
        </p>
      </ReviewBlock>
      <ReviewBlock title="Fecha y hora" onEdit={() => onEdit(1)}>
        <p className="flex items-center gap-2 text-sm text-white/80">
          <CalendarCheck className="size-4 text-lime-400" />
          <span className="first-letter:uppercase">{longDay(slot.start)}</span> · {timeLabel(slot.start)} – {timeLabel(slot.end)}
        </p>
      </ReviewBlock>
      <ReviewBlock title="Datos y lugar de la visita" onEdit={() => onEdit(2)}>
        <p className="flex items-start gap-2 text-sm text-white/80">
          <MapPin className="mt-0.5 size-4 shrink-0 text-lime-400" /> {customer.address}, {customer.city}
        </p>
        <p className="mt-2 text-sm text-white/60">
          {customer.name} · {customer.phone}
          {customer.email && ` · ${customer.email}`}
        </p>
        {customer.notes && <p className="mt-2 rounded-xl bg-white/5 p-3 text-sm text-white/70">“{customer.notes}”</p>}
      </ReviewBlock>
    </div>
  );
}

function SubmitBooking({ pending, onSubmit }: { pending: boolean; onSubmit: (honeypot: string) => void }) {
  const [honeypot, setHoneypot] = useState("");
  return (
    <>
      {/* Hidden from people; bots tend to fill every field. */}
      <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />
      <button
        type="button"
        disabled={pending}
        onClick={() => onSubmit(honeypot)}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-4 font-semibold text-navy-900 transition-colors hover:bg-white disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" /> : <CalendarCheck className="size-5" />}
        Solicitar cita
      </button>
      <p className="text-center text-[11px] leading-snug text-white/45">
        Apartamos el horario y se abre WhatsApp con los datos de tu cita. Te confirmamos por ese chat.
      </p>
    </>
  );
}

/** Booking saved: shown while WhatsApp opens and when the customer comes back. */
function Booked({ url, confirmed, reference, slot }: { url: string; confirmed: boolean; reference: string; slot: Slot }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center sm:p-12">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-lime-400 text-navy-900">
        <CalendarCheck className="size-8" />
      </span>
      <h2 className="mt-6 text-2xl font-bold text-white">{confirmed ? "¡Cita agendada!" : "¡Solicitud de cita enviada!"}</h2>
      <p className="mt-2 text-lg font-semibold text-lime-300 first-letter:uppercase">
        {longDay(slot.start)} · {timeLabel(slot.start)}
      </p>
      <p className="mt-3 text-pretty text-white/70">
        {confirmed
          ? "Tu horario quedó reservado. Envía el mensaje de WhatsApp para que el técnico tenga todos los datos."
          : "Apartamos este horario para ti. Envía el mensaje de WhatsApp y te confirmamos la cita por ese mismo chat apenas lo revisemos."}
      </p>
      <p className="mt-4 font-mono text-sm text-white/50">
        Código: <span className="text-white">{reference}</span>
      </p>
      <a href={url} {...newTab} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 font-semibold text-navy-950 hover:brightness-110">
        <WhatsAppIcon className="size-5" /> Abrir WhatsApp
      </a>
      <p className="mt-5">
        <Link href="/" className="text-sm font-semibold text-white/60 hover:text-white">
          Volver al inicio
        </Link>
      </p>
    </motion.div>
  );
}

// ── Small pieces ────────────────────────────────────────────────────────

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className={clsx("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg", value ? "bg-lime-400/15 text-lime-300" : "bg-white/5 text-white/30")}>{icon}</span>
      <div className="min-w-0">
        <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">{label}</dt>
        <dd className={clsx("mt-0.5", value ? "text-white" : "text-white/35")}>{value ?? "Por elegir"}</dd>
      </div>
    </div>
  );
}

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

function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-4 font-semibold text-navy-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-lime-400"
    >
      {children}
    </button>
  );
}
