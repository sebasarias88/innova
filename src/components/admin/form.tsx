"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { BusyContent } from "@/components/ui/Busy";
import clsx from "clsx";

export function Field({ label, id, ...props }: { label: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-xs font-semibold text-white/70">{label}</span>
      <input
        id={id}
        {...props}
        className={clsx(
          "mt-1.5 w-full rounded-xl border border-white/10 bg-navy-950/60 px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-lime-400/70",
          props.className,
        )}
      />
    </label>
  );
}

export function SubmitButton({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={clsx(
        "relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-white",
        pending ? "cursor-wait" : "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      <BusyContent busy={pending}>{children}</BusyContent>
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200">
      {message}
    </p>
  );
}
