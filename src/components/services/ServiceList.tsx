"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/services";
import { Icon } from "@/components/ui/Icon";

/** Lista grande con previsualización de imagen que sigue al cursor */
export function ServiceList() {
  const [hover, setHover] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 25 });
  const sy = useSpring(y, { stiffness: 200, damping: 25 });

  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => setHover(null)}
    >
      <ul className="border-t border-white/10">
        {services.map((s, i) => (
          <li key={s.slug} onPointerEnter={() => setHover(i)}>
            <Link
              href={`/servicios/${s.slug}`}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-white/10 py-7 sm:gap-10 sm:py-9"
            >
              <span className="font-mono text-xs text-white/40">0{i + 1}</span>
              <span>
                <span className="flex items-center gap-4">
                  <Icon name={s.icon} className="hidden size-8 text-royal-300 transition-colors group-hover:text-lime-400 sm:block" />
                  <span className="text-3xl font-bold tracking-tight text-white transition-transform duration-500 group-hover:translate-x-3 sm:text-5xl lg:text-6xl">
                    {s.name}
                  </span>
                </span>
                <span className="mt-2 block max-w-xl text-sm text-white/50 sm:pl-12">{s.short}</span>
              </span>
              <span className="grid size-12 place-items-center rounded-full border border-white/15 text-white transition-all duration-300 group-hover:rotate-45 group-hover:border-lime-400 group-hover:bg-lime-400 group-hover:text-navy-900 sm:size-16">
                <ArrowUpRight className="size-5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <motion.div
        className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[260px] w-[360px] lg:block"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      >
        <AnimatePresence>
          {hover !== null && (
            <motion.div
              key={hover}
              className="absolute inset-0 overflow-hidden rounded-2xl"
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35 }}
            >
              <Image src={services[hover].image} alt="" fill sizes="360px" className="object-cover" />
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-black/50 px-2 py-1 font-mono text-[10px] uppercase text-white">
                <span className="size-1.5 animate-blink rounded-full bg-red-500" /> CAM-0{hover + 1}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
