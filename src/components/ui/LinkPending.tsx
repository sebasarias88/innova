"use client";

import { useLinkStatus } from "next/link";
import clsx from "clsx";
import { LoaderCircle } from "lucide-react";

/**
 * Put inside a <Link>: while the page it opens is loading, the link shows a
 * spinner over its (invisible) text, so the tap is acknowledged right away.
 */
export function LinkPending({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <span className={clsx(pending && "invisible", className)}>{children}</span>
      {pending && (
        <span className="absolute inset-0 grid place-items-center" role="status">
          <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />
          <span className="sr-only">Cargando…</span>
        </span>
      )}
    </>
  );
}
