import clsx from "clsx";
import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

/**
 * Content of a button that can be loading. While busy, the label keeps its
 * space (invisible) and a spinner sits on top, so the button never changes
 * size. The button itself needs `relative` and should be disabled while busy.
 */
export function BusyContent({ busy, children, spinnerClassName }: { busy: boolean; children: ReactNode; spinnerClassName?: string }) {
  return (
    <>
      <span className={clsx("inline-flex items-center justify-center gap-2", busy && "invisible")}>{children}</span>
      {busy && (
        <span className="absolute inset-0 grid place-items-center" role="status">
          <LoaderCircle aria-hidden className={clsx("size-4 motion-safe:animate-spin", spinnerClassName)} />
          <span className="sr-only">Cargando…</span>
        </span>
      )}
    </>
  );
}

export function Spinner({ className, label = "Cargando…" }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex">
      <LoaderCircle aria-hidden className={clsx("size-4 motion-safe:animate-spin", className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
