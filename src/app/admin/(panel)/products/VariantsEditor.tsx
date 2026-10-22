"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import clsx from "clsx";

export type VariantDraft = {
  key: number;
  id: string;
  name: string;
  highlight: string;
  sku: string;
  price: string;
  compare_at_price: string;
  is_available: boolean;
};

const input =
  "mt-1 w-full rounded-lg border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-lime-400/70";
const fmt = (v: string) => (v ? Number(v).toLocaleString("es-CO") : "");
const digits = (v: string) => v.replace(/\D/g, "").slice(0, 10);

/**
 * Options of one product (3 MP / 5 MP…): name, highlight, price, previous
 * price, reference and availability. Photos and description are shared.
 * The list travels to the server as JSON in a hidden field.
 */
export function VariantsEditor({ variants, onChange }: { variants: VariantDraft[]; onChange: (next: VariantDraft[]) => void }) {
  const update = (key: number, patch: Partial<VariantDraft>) => onChange(variants.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  const move = (index: number, dir: -1 | 1) => {
    const next = [...variants];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    onChange(next);
  };
  const add = () =>
    onChange([
      ...variants,
      { key: Math.max(0, ...variants.map((v) => v.key)) + 1, id: "", name: "", highlight: "", sku: "", price: "", compare_at_price: "", is_available: true },
    ]);

  return (
    <div>
      <input
        type="hidden"
        name="variants_json"
        value={JSON.stringify(
          variants.map((v) => ({
            id: v.id,
            name: v.name,
            highlight: v.highlight,
            sku: v.sku,
            price: v.price,
            compare_at_price: v.compare_at_price,
            is_available: v.is_available,
          })),
        )}
      />
      {variants.length > 0 && (
        <ul className="space-y-3">
          {variants.map((v, i) => (
            <li key={v.key} className={clsx("rounded-2xl border p-4", v.is_available ? "border-white/10 bg-white/[0.02]" : "border-red-400/20 bg-red-500/[0.04]")}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Opción {i + 1}</p>
                <div className="flex items-center gap-1">
                  <IconButton label="Subir" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="size-4" />
                  </IconButton>
                  <IconButton label="Bajar" disabled={i === variants.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown className="size-4" />
                  </IconButton>
                  <IconButton label="Quitar opción" danger onClick={() => onChange(variants.filter((x) => x.key !== v.key))}>
                    <X className="size-4" />
                  </IconButton>
                </div>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_1.6fr]">
                <label className="block text-xs font-semibold text-white/70">
                  Nombre de la opción *
                  <input className={input} value={v.name} maxLength={60} required placeholder="3 MP" onChange={(e) => update(v.key, { name: e.target.value })} />
                </label>
                <label className="block text-xs font-semibold text-white/70">
                  Lo que la destaca
                  <input
                    className={input}
                    value={v.highlight}
                    maxLength={120}
                    placeholder="Opcional: Mayor nitidez y visión nocturna a color"
                    onChange={(e) => update(v.key, { highlight: e.target.value })}
                  />
                </label>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <label className="block text-xs font-semibold text-white/70">
                  Precio *
                  <span className="relative block">
                    <span className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-sm text-white/40">$</span>
                    <input
                      className={clsx(input, "pl-6")}
                      inputMode="numeric"
                      required
                      value={fmt(v.price)}
                      placeholder="0"
                      onChange={(e) => update(v.key, { price: digits(e.target.value) })}
                    />
                  </span>
                </label>
                <label className="block text-xs font-semibold text-white/70">
                  Precio anterior
                  <span className="relative block">
                    <span className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-sm text-white/40">$</span>
                    <input
                      className={clsx(input, "pl-6")}
                      inputMode="numeric"
                      value={fmt(v.compare_at_price)}
                      placeholder="Opcional"
                      onChange={(e) => update(v.key, { compare_at_price: digits(e.target.value) })}
                    />
                  </span>
                </label>
                <label className="col-span-2 block text-xs font-semibold text-white/70 sm:col-span-1">
                  Referencia / SKU
                  <input className={input} value={v.sku} maxLength={60} placeholder="Opcional" onChange={(e) => update(v.key, { sku: e.target.value })} />
                </label>
                <label className="col-span-2 flex cursor-pointer items-center gap-2 self-end pb-2 text-xs font-semibold text-white/70 sm:col-span-1">
                  <input type="checkbox" checked={v.is_available} onChange={(e) => update(v.key, { is_available: e.target.checked })} className="peer sr-only" />
                  <span className="relative h-5 w-9 shrink-0 rounded-full bg-white/15 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-lime-400 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-lime-400/60" />
                  {v.is_available ? "Disponible" : "Agotada"}
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={add} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-400 hover:text-white">
        <Plus className="size-4" /> {variants.length ? "Agregar otra opción" : "Agregar opciones (ej. 3 MP / 5 MP)"}
      </button>
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors disabled:opacity-30",
        danger ? "hover:border-red-400/40 hover:text-red-300" : "hover:border-white/30 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
