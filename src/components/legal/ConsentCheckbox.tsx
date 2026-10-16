"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import clsx from "clsx";
import { legalLinks } from "@/lib/legal";

/** Required, unchecked-by-default authorization (Ley 1581 de 2012). */
export function ConsentCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left text-xs leading-snug text-white/65">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={clsx(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-lime-400",
          checked ? "border-lime-400 bg-lime-400 text-navy-900" : "border-white/30",
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span>
        Autorizo el tratamiento de mis datos según la{" "}
        <Link href={legalLinks.privacy} target="_blank" className="font-semibold text-lime-400 underline-offset-2 hover:underline">
          política de datos
        </Link>{" "}
        y acepto los{" "}
        <Link href={legalLinks.terms} target="_blank" className="font-semibold text-lime-400 underline-offset-2 hover:underline">
          términos y condiciones
        </Link>
        .
      </span>
    </label>
  );
}
