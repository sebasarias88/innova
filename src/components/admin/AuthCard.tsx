import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

/** Centered card used by the login and two-step verification screens. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_0%,rgb(6_96_216/0.25),transparent_70%)]" />
      <div className="relative w-full max-w-sm">
        <Logo className="mx-auto h-9 w-auto" priority />
        <div className="mt-8 rounded-3xl border border-white/10 bg-navy-900/80 p-6 shadow-2xl shadow-black/40 sm:p-8">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-white/60">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
          <ShieldCheck className="size-3.5" /> Acceso restringido
        </p>
      </div>
    </main>
  );
}
