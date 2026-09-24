"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { process } from "@/lib/site";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const h = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative bg-ice-50 py-24 text-navy-900 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow dark>Cómo trabajamos</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-tight sm:text-6xl">
            De la visita técnica a la <span className="text-royal-500">tranquilidad total.</span>
          </h2>
          <p className="mt-6 max-w-md text-pretty text-lg text-navy-900/65">
            Un proceso claro, sin sorpresas. Te acompañamos antes, durante y después de la instalación.
          </p>
        </div>

        <div ref={ref} className="relative pl-10 sm:pl-16">
          <div className="absolute bottom-0 left-3 top-0 w-px bg-navy-900/10 sm:left-5" />
          <motion.div style={{ height: h }} className="absolute left-3 top-0 w-px origin-top bg-royal-500 sm:left-5" />
          <div className="space-y-6">
            {process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-3xl border border-navy-900/10 bg-white p-7 shadow-[0_20px_60px_-30px_rgba(4,40,116,0.25)] sm:p-9"
              >
                <span className="absolute -left-[2.35rem] top-9 grid size-6 place-items-center rounded-full bg-royal-500 ring-4 ring-ice-50 sm:-left-[3.35rem]">
                  <span className="size-2 rounded-full bg-lime-400" />
                </span>
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-sm text-royal-500">{p.step}</span>
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{p.title}</h3>
                </div>
                <p className="mt-3 text-pretty text-navy-900/65 sm:pl-10">{p.text}</p>
                {i === 0 && (
                  <span className="mt-5 inline-block rounded-full bg-lime-400 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider sm:ml-10">
                    Visita de diagnóstico sin costo
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
