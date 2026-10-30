"use client";

import { useState, useTransition } from "react";
import { BusyContent } from "@/components/ui/Busy";
import clsx from "clsx";
import { toast } from "sonner";
import { ActionForm, SaveButton, SelectField, TextArea, TextField, Toggle } from "@/components/admin/fields";
import { WEEKDAYS } from "@/lib/admin/format";
import { BOOKING_STATUS } from "@/lib/admin/status";
import { addException, addRule, saveBookingSettings, toggleRule, updateBooking } from "./actions";

const SLOT_OPTIONS = [30, 45, 60, 90, 120, 180, 240];

export function RuleForm() {
  return (
    <ActionForm action={addRule} className="space-y-4">
      <SelectField label="Día" name="weekday" defaultValue="1" options={WEEKDAYS.map((d, i) => ({ value: String(i), label: d }))} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Desde" name="start_time" type="time" required defaultValue="08:00" />
        <TextField label="Hasta" name="end_time" type="time" required defaultValue="12:00" />
      </div>
      <SlotSelect />
      <SaveButton>Agregar horario</SaveButton>
    </ActionForm>
  );
}

function SlotSelect({ defaultValue = 120 }: { defaultValue?: number }) {
  return (
    <SelectField
      label="Duración de cada cita"
      name="slot_minutes"
      defaultValue={String(defaultValue)}
      hint="Cada cuánto se ofrece una hora para agendar."
      options={SLOT_OPTIONS.map((m) => ({ value: String(m), label: m < 60 ? `${m} minutos` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} hora${m === 60 ? "" : "s"}` }))}
    />
  );
}

export function ExceptionForm({ minDate }: { minDate: string }) {
  const [mode, setMode] = useState<"closed" | "special">("closed");
  return (
    <ActionForm action={addException} className="space-y-4">
      <TextField label="Fecha" name="date" type="date" required min={minDate} />
      <input type="hidden" name="mode" value={mode} />
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-navy-950/60 p-1">
        {(
          [
            ["closed", "Cerrado"],
            ["special", "Horario especial"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={clsx("rounded-lg px-2 py-2 text-xs font-semibold", mode === value ? "bg-lime-400 text-navy-900" : "text-white/60 hover:text-white")}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "special" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Desde" name="start_time" type="time" required defaultValue="09:00" />
            <TextField label="Hasta" name="end_time" type="time" required defaultValue="12:00" />
          </div>
          <SlotSelect />
        </>
      )}
      <TextField label="Motivo (opcional)" name="note" maxLength={160} placeholder="Festivo, inventario…" />
      <SaveButton>{mode === "closed" ? "Cerrar este día" : "Guardar horario especial"}</SaveButton>
    </ActionForm>
  );
}

export function SettingsForm({ settings }: { settings: { is_enabled: boolean; auto_confirm: boolean; lead_time_hours: number; max_days_ahead: number } }) {
  return (
    <ActionForm action={saveBookingSettings} className="space-y-4">
      <Toggle label="Agenda en línea activa" description="Si la apagas, la web no mostrará horarios disponibles." name="is_enabled" defaultChecked={settings.is_enabled} />
      <Toggle
        label="Confirmar citas automáticamente"
        description="Si la activas, la cita queda confirmada apenas el cliente la agenda. Apagada (recomendado), queda “Por confirmar” y ustedes confirman por WhatsApp. En ambos casos el horario se bloquea."
        name="auto_confirm"
        defaultChecked={settings.auto_confirm}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Anticipación mínima (horas)"
          name="lead_time_hours"
          type="number"
          min={0}
          max={336}
          required
          defaultValue={settings.lead_time_hours}
          hint="Ej: 12 = no se puede agendar para dentro de menos de 12 horas."
        />
        <TextField label="Días hacia adelante" name="max_days_ahead" type="number" min={1} max={180} required defaultValue={settings.max_days_ahead} hint="Hasta cuántos días en el futuro se puede agendar." />
      </div>
      <SaveButton>Guardar ajustes</SaveButton>
    </ActionForm>
  );
}

export function BookingStatusForm({ id, status, notes }: { id: string; status: string; notes: string | null }) {
  return (
    <ActionForm action={updateBooking.bind(null, id)} className="space-y-3">
      <SelectField label="Estado" name="status" defaultValue={status} options={Object.entries(BOOKING_STATUS).map(([value, s]) => ({ value, label: s.label }))} />
      <TextArea label="Notas internas" name="internal_notes" rows={2} maxLength={1000} defaultValue={notes ?? ""} />
      <SaveButton>Guardar</SaveButton>
    </ActionForm>
  );
}

export function RuleToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      onClick={() =>
        start(async () => {
          const r = await toggleRule(id, !active);
          if (r && !r.ok) toast.error(r.error);
          else toast.success(active ? "Horario pausado." : "Horario activado.");
        })
      }
      className={clsx(
        "relative rounded-full border px-2.5 py-1 text-[11px] font-semibold disabled:cursor-wait",
        active ? "border-lime-400/30 bg-lime-400/10 text-lime-300" : "border-white/15 text-white/50",
      )}
    >
      {/* The spinner stays until the refreshed list arrives (same transition). */}
      <BusyContent busy={pending} spinnerClassName="size-3">
        {active ? "Activo" : "Pausado"}
      </BusyContent>
    </button>
  );
}
