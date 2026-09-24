"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus } from "lucide-react";
import clsx from "clsx";

export function Faq({ items, dark }: { items: { q: string; a: string }[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={clsx("divide-y", dark ? "divide-white/10 border-y border-white/10" : "divide-navy-900/10 border-y border-navy-900/10")}>
      {items.map((it, i) => (
        <div key={it.q}>
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
            <span className={clsx("text-lg font-semibold tracking-tight sm:text-xl", dark ? "text-white" : "text-navy-900")}>{it.q}</span>
            <span
              className={clsx(
                "grid size-9 shrink-0 place-items-center rounded-full transition-all duration-300",
                open === i ? "rotate-45 bg-lime-400 text-navy-900" : dark ? "bg-white/10 text-white" : "bg-navy-900/5 text-navy-900",
              )}
            >
              <Plus className="size-4" />
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className={clsx("max-w-3xl pb-6 text-pretty leading-relaxed", dark ? "text-white/65" : "text-navy-900/65")}>{it.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
