import clsx from "clsx";

/** Esquinas de encuadre de cámara */
export function HudCorners({ className, size = 18 }: { className?: string; size?: number }) {
  const s = { width: size, height: size };
  const b = "absolute border-current";
  return (
    <div className={clsx("pointer-events-none absolute inset-0", className)} aria-hidden>
      <span style={s} className={clsx(b, "left-0 top-0 border-l-2 border-t-2")} />
      <span style={s} className={clsx(b, "right-0 top-0 border-r-2 border-t-2")} />
      <span style={s} className={clsx(b, "bottom-0 left-0 border-b-2 border-l-2")} />
      <span style={s} className={clsx(b, "bottom-0 right-0 border-b-2 border-r-2")} />
    </div>
  );
}
