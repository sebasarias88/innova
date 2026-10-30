"use client";

import { useFormStatus } from "react-dom";
import { BusyContent } from "@/components/ui/Busy";

/** "Buscar" with a spinner while the results load. */
export function SearchButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-white disabled:cursor-wait"
    >
      <span className="relative inline-grid place-items-center">
        <BusyContent busy={pending}>Buscar</BusyContent>
      </span>
    </button>
  );
}
