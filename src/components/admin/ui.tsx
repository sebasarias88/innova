import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link href={back.href} className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white">
          <ArrowLeft className="size-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-white/55">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Card({ title, description, children, className }: { title?: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx("rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6", className)}>
      {title && <h2 className="text-base font-bold">{title}</h2>}
      {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
      <div className={clsx(title && "mt-5")}>{children}</div>
    </section>
  );
}

const tones = {
  lime: "border-lime-400/30 bg-lime-400/10 text-lime-300",
  blue: "border-royal-400/30 bg-royal-500/15 text-royal-300",
  red: "border-red-400/30 bg-red-500/10 text-red-300",
  amber: "border-amber-300/30 bg-amber-400/10 text-amber-200",
  gray: "border-white/15 bg-white/5 text-white/60",
} as const;
export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "gray", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={clsx("inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

export function LinkButton({ href, children, variant = "primary", icon }: { href: string; children: ReactNode; variant?: "primary" | "ghost"; icon?: ReactNode }) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
        variant === "primary" ? "bg-lime-400 text-navy-900 hover:bg-white" : "border border-white/15 text-white/80 hover:border-white/40 hover:text-white",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
      <p className="font-semibold">{title}</p>
      {description && <p className="mx-auto mt-1.5 max-w-sm text-sm text-white/50">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/** Responsive table wrapper: scrolls horizontally on small screens. */
export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-white/10 bg-white/[0.03] text-xs text-white/50">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pageSize, total, hrefFor }: { page: number; pageSize: number; total: number; hrefFor: (page: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const btn = "rounded-full border border-white/15 px-3.5 py-1.5 text-sm";
  return (
    <nav className="mt-5 flex items-center justify-between gap-3 text-sm text-white/55">
      <span>
        Página {page} de {pages} · {total} resultados
      </span>
      <div className="flex gap-2">
        {page > 1 ? <Link className={clsx(btn, "hover:border-white/40 hover:text-white")} href={hrefFor(page - 1)}>Anterior</Link> : <span className={clsx(btn, "opacity-40")}>Anterior</span>}
        {page < pages ? <Link className={clsx(btn, "hover:border-white/40 hover:text-white")} href={hrefFor(page + 1)}>Siguiente</Link> : <span className={clsx(btn, "opacity-40")}>Siguiente</span>}
      </div>
    </nav>
  );
}
