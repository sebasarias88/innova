import clsx from "clsx";

export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={clsx("relative flex overflow-hidden", className)}>
      <div className="flex shrink-0 animate-marquee items-center gap-10 whitespace-nowrap pr-10">
        {row.concat(row).map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span>{t}</span>
            <svg viewBox="0 0 10 10" className="size-2.5 fill-current opacity-60" aria-hidden>
              <path d="M5 0 10 5 5 10 0 5z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
