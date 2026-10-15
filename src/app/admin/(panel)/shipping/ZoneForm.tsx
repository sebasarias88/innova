"use client";

import { useState } from "react";
import { ActionForm, MoneyField, SaveButton, TextField, Toggle } from "@/components/admin/fields";
import type { ActionResult } from "@/lib/admin/actions";
import clsx from "clsx";

type Zone = { name: string; description: string | null; price: number | null; is_pickup: boolean; is_active: boolean; sort_order: number };
type Mode = "free" | "fixed" | "agreed";

const modes: { value: Mode; label: string }[] = [
  { value: "free", label: "Gratis" },
  { value: "fixed", label: "Valor fijo" },
  { value: "agreed", label: "A convenir" },
];

export function ZoneForm({ action, zone, submitLabel }: { action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>; zone?: Zone; submitLabel: string }) {
  const initial: Mode = !zone ? "fixed" : zone.price === null ? "agreed" : zone.price === 0 ? "free" : "fixed";
  const [mode, setMode] = useState<Mode>(initial);

  return (
    <ActionForm action={action} resetOnSuccess={!zone} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <TextField label="Nombre de la zona" name="name" required minLength={2} maxLength={80} defaultValue={zone?.name} placeholder="Ej: Calarcá y La Tebaida" />
        <TextField label="Orden" name="sort_order" type="number" min={-9999} max={9999} defaultValue={zone?.sort_order ?? 0} />
      </div>
      <TextField label="Descripción para el cliente" name="description" maxLength={280} defaultValue={zone?.description ?? ""} placeholder="Ej: Entrega en 1 a 2 días hábiles" />

      <fieldset>
        <legend className="text-xs font-semibold text-white/70">Costo del envío</legend>
        <input type="hidden" name="price_mode" value={mode} />
        <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-navy-950/60 p-1">
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={clsx("rounded-lg px-2 py-2 text-xs font-semibold transition-colors", mode === m.value ? "bg-lime-400 text-navy-900" : "text-white/60 hover:text-white")}
            >
              {m.label}
            </button>
          ))}
        </div>
        {mode === "agreed" && <p className="mt-1.5 text-[11px] text-white/45">El cliente verá “Envío a convenir” y el valor se acuerda por WhatsApp.</p>}
      </fieldset>
      {mode === "fixed" && <MoneyField label="Valor del envío (COP)" name="price" required defaultValue={zone?.price || null} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="Recoger en tienda" description="No pide dirección." name="is_pickup" defaultChecked={zone?.is_pickup ?? false} />
        <Toggle label="Activa" description="Se ofrece en el carrito." name="is_active" defaultChecked={zone?.is_active ?? true} />
      </div>
      <SaveButton>{submitLabel}</SaveButton>
    </ActionForm>
  );
}
