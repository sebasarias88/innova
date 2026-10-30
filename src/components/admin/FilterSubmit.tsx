"use client";

import { useFormStatus } from "react-dom";
import { Search } from "lucide-react";
import clsx from "clsx";
import { BusyContent, Spinner } from "@/components/ui/Busy";

/** Search icon of a filter form: becomes a spinner while the results load. */
export function SearchStatusIcon({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  return pending ? (
    <span className={clsx("pointer-events-none text-white/60", className)}>
      <Spinner />
    </span>
  ) : (
    <Search className={clsx("pointer-events-none size-4 text-white/35", className)} />
  );
}

/** Submit button of a filter form, with a spinner while the results load. */
export function FilterButton({ children = "Filtrar", className }: { children?: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={clsx("relative disabled:cursor-wait", className)}>
      <BusyContent busy={pending}>{children}</BusyContent>
    </button>
  );
}
