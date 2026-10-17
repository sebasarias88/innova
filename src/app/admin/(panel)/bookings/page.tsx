import type { Metadata } from "next";
import Link from "next/link";
import { CalendarX2, Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import clsx from "clsx";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { TIME_ZONE, WEEKDAYS, formatClock, formatDate, formatMinutes, formatTime, whatsappUrl } from "@/lib/admin/format";
import { BOOKING_STATUS } from "@/lib/admin/status";
import { getService } from "@/lib/services";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/fields";
import { deleteException, deleteRule } from "./actions";
import { BookingStatusForm, ExceptionForm, RuleForm, RuleToggle, SettingsForm } from "./forms";

export const metadata: Metadata = { title: "Agenda" };

const TABS = [
  { value: "citas", label: "Citas" },
  { value: "horario", label: "Horario semanal" },
  { value: "fechas", label: "Fechas especiales" },
  { value: "ajustes", label: "Ajustes" },
] as const;

const todayInBogota = () => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
const daysFromNow = (days: number) => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date(Date.now() + days * 86_400_000));

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ tab?: string; view?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.value === sp.tab)?.value ?? "citas";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Agenda" description="Citas de servicio agendadas desde la web y los horarios disponibles para los clientes." />
      <nav className="-mx-4 mb-6 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/admin/bookings?tab=${t.value}`}
            className={clsx("whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold", t.value === tab ? "bg-white text-navy-900" : "text-white/60 hover:bg-white/5 hover:text-white")}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {tab === "citas" && <Appointments view={sp.view} />}
      {tab === "horario" && <WeeklySchedule />}
      {tab === "fechas" && <SpecialDates />}
      {tab === "ajustes" && <Settings />}
    </div>
  );
}

async function Appointments({ view }: { view?: string }) {
  const supabase = await createClient();
  const past = view === "past";
  const now = new Date().toISOString();
  let query = supabase.from("bookings").select("*").order("starts_at", { ascending: !past }).limit(100);
  query = past ? query.lt("starts_at", now) : query.gte("starts_at", now).in("status", ["pending", "confirmed"]);
  const { data: bookings } = await query;

  // Group by day for a calendar-like reading.
  const groups = new Map<string, NonNullable<typeof bookings>>();
  for (const b of bookings ?? []) {
    const day = formatDate(b.starts_at);
    groups.set(day, [...(groups.get(day) ?? []), b]);
  }

  return (
    <>
      <div className="mb-5 flex gap-2 text-sm">
        <Link href="/admin/bookings?tab=citas" className={clsx("rounded-full border px-3 py-1.5", !past ? "border-lime-400/50 text-lime-300" : "border-white/10 text-white/60")}>
          Próximas
        </Link>
        <Link href="/admin/bookings?tab=citas&view=past" className={clsx("rounded-full border px-3 py-1.5", past ? "border-lime-400/50 text-lime-300" : "border-white/10 text-white/60")}>
          Anteriores
        </Link>
      </div>
      {groups.size === 0 ? (
        <EmptyState title={past ? "No hay citas anteriores" : "No hay citas próximas"} description="Las citas agendadas desde la web aparecerán aquí." />
      ) : (
        <div className="space-y-8">
          {[...groups.entries()].map(([day, list]) => (
            <section key={day}>
              <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-white/45">{day}</h2>
              <ul className="space-y-3">
                {list.map((b) => {
                  const status = BOOKING_STATUS[b.status];
                  const service = getService(b.service_slug)?.name ?? b.service_slug;
                  const message = [
                    `Hola, ${b.customer_name.split(" ")[0]} 👋 Te escribimos de INNOVA Seguridad y Sistemas sobre tu visita técnica:`,
                    "",
                    `🔧 Servicio: ${service}`,
                    `📅 Fecha: ${formatDate(b.starts_at)}, ${formatTime(b.starts_at)} – ${formatTime(b.ends_at)}`,
                    `📍 Dirección: ${[b.address, b.city].filter(Boolean).join(", ")}`,
                    `🧾 Código de la cita: ${b.reference}`,
                  ].join("\n");
                  return (
                    <li key={b.id}>
                      <details className="group rounded-2xl border border-white/10 bg-white/[0.03]">
                        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 hover:bg-white/5">
                          <span className="flex items-center gap-1.5 font-mono text-sm font-semibold">
                            <Clock className="size-4 text-lime-400" /> {formatTime(b.starts_at)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold">{b.customer_name}</span>
                            <span className="block text-xs text-white/45">
                              {service} · #{b.booking_number} · {b.reference}
                            </span>
                          </span>
                          <Badge tone={status?.tone}>{status?.label ?? b.status}</Badge>
                        </summary>
                        <div className="grid gap-5 border-t border-white/10 p-4 sm:grid-cols-2">
                          <div className="space-y-2 text-sm text-white/75">
                            <p className="flex items-center gap-2">
                              <Phone className="size-4 text-white/40" /> {b.customer_phone}
                            </p>
                            <p className="flex items-start gap-2">
                              <MapPin className="mt-0.5 size-4 text-white/40" /> {[b.address, b.city].filter(Boolean).join(", ")}
                            </p>
                            {b.customer_email && <p className="text-white/55">{b.customer_email}</p>}
                            {b.notes && <p className="rounded-xl bg-white/5 p-3 text-white/70">“{b.notes}”</p>}
                            <a
                              href={whatsappUrl(b.customer_phone, message)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-navy-950 hover:brightness-110"
                            >
                              <MessageCircle className="size-4" /> WhatsApp
                            </a>
                          </div>
                          <BookingStatusForm id={b.id} status={b.status} notes={b.internal_notes} />
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

async function WeeklySchedule() {
  const supabase = await createClient();
  const today = todayInBogota();
  const until = daysFromNow(6);
  const [{ data: rules }, { data: slots }] = await Promise.all([
    supabase.from("availability_rules").select("*").order("weekday").order("start_time"),
    supabase.rpc("get_available_slots", { p_from: today, p_to: until }),
  ]);

  const preview = new Map<string, string[]>();
  for (const s of slots ?? []) {
    const day = new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric", month: "short", timeZone: TIME_ZONE }).format(new Date(s.starts_at));
    preview.set(day, [...(preview.get(day) ?? []), formatTime(s.starts_at)]);
  }
  // Monday first, Sunday last
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Card title="Horario de atención" description="Franjas en las que los clientes pueden agendar cada semana.">
          <ul className="divide-y divide-white/5">
            {order.map((d) => {
              const dayRules = (rules ?? []).filter((r) => r.weekday === d);
              return (
                <li key={d} className="grid gap-2 py-3 sm:grid-cols-[110px_1fr]">
                  <span className="text-sm font-semibold">{WEEKDAYS[d]}</span>
                  {dayRules.length === 0 ? (
                    <span className="text-sm text-white/35">Sin atención</span>
                  ) : (
                    <ul className="space-y-2">
                      {dayRules.map((r) => (
                        <li key={r.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <span className={clsx("font-mono", !r.is_active && "text-white/35 line-through")}>
                            {formatClock(r.start_time)} – {formatClock(r.end_time)}
                          </span>
                          <span className="text-xs text-white/40">citas de {formatMinutes(r.slot_minutes)}</span>
                          <span className="ml-auto flex items-center gap-2">
                            <RuleToggle id={r.id} active={r.is_active} />
                            <ConfirmButton action={deleteRule.bind(null, r.id)} confirmText="¿Eliminar este horario?" className="px-2.5 py-1 text-xs">
                              Quitar
                            </ConfirmButton>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="Vista previa · próximos 7 días" description="Así ve el cliente los horarios libres (ya descuenta citas y la anticipación mínima).">
          {preview.size === 0 ? (
            <p className="text-sm text-white/45">No hay horarios disponibles en los próximos 7 días.</p>
          ) : (
            <ul className="space-y-3">
              {[...preview.entries()].map(([day, times]) => (
                <li key={day}>
                  <p className="text-xs font-semibold text-white/60 first-letter:uppercase">{day}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {times.map((t) => (
                      <span key={t} className="rounded-lg border border-white/10 px-2 py-1 font-mono text-[11px] text-white/70">
                        {t}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <Card title="Agregar horario" className="lg:sticky lg:top-6">
        <RuleForm />
      </Card>
    </div>
  );
}

async function SpecialDates() {
  const supabase = await createClient();
  const today = todayInBogota();
  const { data: exceptions } = await supabase.from("availability_exceptions").select("*").gte("date", today).order("date").order("start_time");

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        {!exceptions?.length ? (
          <EmptyState title="Sin fechas especiales" description="Marca festivos, vacaciones o días con horario distinto." />
        ) : (
          <ul className="space-y-3">
            {exceptions.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
                <CalendarX2 className={clsx("size-5", e.is_closed ? "text-red-300" : "text-royal-300")} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold first-letter:uppercase">
                    {new Intl.DateTimeFormat("es-CO", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${e.date}T00:00:00Z`))}
                  </p>
                  <p className="text-xs text-white/50">
                    {e.is_closed ? "Cerrado" : `Horario especial ${formatClock(e.start_time)} – ${formatClock(e.end_time)} · citas de ${formatMinutes(e.slot_minutes)}`}
                    {e.note && ` · ${e.note}`}
                  </p>
                </div>
                <ConfirmButton action={deleteException.bind(null, e.id)} confirmText="¿Quitar esta fecha especial?" className="px-2.5 py-1 text-xs">
                  Quitar
                </ConfirmButton>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Card title="Agregar fecha" description="Un horario especial reemplaza el horario semanal de ese día." className="lg:sticky lg:top-6">
        <ExceptionForm minDate={today} />
      </Card>
    </div>
  );
}

async function Settings() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("booking_settings").select("is_enabled, auto_confirm, lead_time_hours, max_days_ahead").eq("id", 1).single();
  return (
    <div className="max-w-2xl">
      <Card title="Reglas para agendar">{settings && <SettingsForm settings={settings} />}</Card>
    </div>
  );
}
