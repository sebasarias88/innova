"use client";
import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

export function CountUp({ to, suffix = "", className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const c = animate(0, to, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = Math.round(v).toLocaleString("es-CO") + suffix),
    });
    return () => c.stop();
  }, [inView, to, suffix]);
  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
