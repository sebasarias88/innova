import clsx from "clsx";

/** Etiqueta estilo HUD: ● REC / CAM */
export function Eyebrow({ children, className, dark }: { children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em]",
        dark ? "text-royal-500" : "text-lime-400",
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className={clsx("absolute inline-flex size-full animate-ping rounded-full opacity-60", dark ? "bg-royal-500" : "bg-lime-400")} />
        <span className={clsx("relative inline-flex size-2 rounded-full", dark ? "bg-royal-500" : "bg-lime-400")} />
      </span>
      {children}
    </span>
  );
}
