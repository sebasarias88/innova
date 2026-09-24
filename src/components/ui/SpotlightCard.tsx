"use client";
import clsx from "clsx";
import { useRef, type ReactNode } from "react";

/** Tarjeta con luz que sigue al cursor */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={clsx(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]",
        "before:pointer-events-none before:absolute before:inset-0 before:z-10 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        "before:bg-[radial-gradient(420px_circle_at_var(--x)_var(--y),rgb(233_242_5/0.13),transparent_45%)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
