"use client";

import { useState } from "react";
import { Select as RadixSelect } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

export type SelectOption = { value: string; label: string; disabled?: boolean };

// Radix does not allow "" as an item value, so empty choices use this sentinel.
const EMPTY = "__empty__";
const toRadix = (v: string | undefined) => (v === "" || v == null ? EMPTY : v);
const fromRadix = (v: string) => (v === EMPTY ? "" : v);

/**
 * Styled, accessible dropdown (keyboard, screen readers, touch).
 * Submits through a hidden input, so it works inside any <form> — including
 * plain GET filter forms and Server Action forms.
 */
export function Select({
  name,
  options,
  defaultValue,
  value: controlled,
  onValueChange,
  placeholder = "Selecciona…",
  label,
  hint,
  className,
  size = "md",
  ariaLabel,
}: {
  name?: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  className?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const value = controlled ?? internal;
  const hasEmptyOption = options.some((o) => o.value === "");

  const trigger = (
    <RadixSelect.Root
      value={value === "" && !hasEmptyOption ? undefined : toRadix(value)}
      onValueChange={(v) => {
        const next = fromRadix(v);
        setInternal(next);
        onValueChange?.(next);
      }}
    >
      <RadixSelect.Trigger
        aria-label={ariaLabel ?? label}
        className={clsx(
          "group flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-navy-950/60 text-left text-sm text-white outline-none transition-colors",
          "hover:border-white/20 focus-visible:border-lime-400/70 data-[state=open]:border-lime-400/70 data-[placeholder]:text-white/35",
          size === "md" ? "px-3.5 py-2.5" : "px-3 py-2",
          label && "mt-1.5",
          className,
        )}
      >
        <span className="truncate">
          <RadixSelect.Value placeholder={placeholder} />
        </span>
        <RadixSelect.Icon>
          <ChevronDown className="size-4 shrink-0 text-white/40 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className={clsx(
            "z-50 max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-white/10 bg-navy-900 text-sm text-white shadow-2xl shadow-black/50",
            "data-[state=open]:animate-[select-in_160ms_cubic-bezier(0.16,1,0.3,1)]",
          )}
        >
          <RadixSelect.Viewport className="p-1.5">
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value || EMPTY}
                value={toRadix(o.value)}
                disabled={o.disabled}
                className={clsx(
                  "relative flex cursor-pointer select-none items-center gap-2 rounded-lg py-2 pl-8 pr-3 outline-none transition-colors",
                  "data-[highlighted]:bg-white/[0.07] data-[state=checked]:text-lime-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                  o.value === "" && "text-white/55",
                )}
              >
                <RadixSelect.ItemIndicator className="absolute left-2.5">
                  <Check className="size-4 text-lime-400" />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );

  return (
    <div className={label ? "block" : "contents"}>
      {label && <span className="text-xs font-semibold text-white/70">{label}</span>}
      {trigger}
      {name && <input type="hidden" name={name} value={value} />}
      {hint && <span className="mt-1 block text-[11px] text-white/40">{hint}</span>}
    </div>
  );
}
