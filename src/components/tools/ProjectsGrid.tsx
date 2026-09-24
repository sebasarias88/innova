"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { MapPin } from "lucide-react";
import clsx from "clsx";
import { projects } from "@/lib/projects";
import { getService, services } from "@/lib/services";
import { HudCorners } from "@/components/ui/HudCorners";

export function ProjectsGrid() {
  const [filter, setFilter] = useState<string>("todos");
  const list = filter === "todos" ? projects : projects.filter((p) => p.service === filter);
  const used = services.filter((s) => projects.some((p) => p.service === s.slug));

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {[{ slug: "todos", name: "Todos" }, ...used].map((s) => (
          <button
            key={s.slug}
            onClick={() => setFilter(s.slug)}
            className={clsx(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              filter === s.slug ? "border-lime-400 bg-lime-400 text-navy-900" : "border-white/15 text-white/70 hover:text-white",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>
      <motion.div layout className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.article
              layout
              key={p.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className={clsx("group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-navy-900", i === 0 && filter === "todos" && "md:col-span-2 lg:row-span-2")}
            >
              <div className={clsx("relative", i === 0 && filter === "todos" ? "aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[640px]" : "aspect-[4/3]")}>
                <Image src={p.image} alt={p.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
                <HudCorners className="m-4 text-white/30 transition-colors group-hover:text-lime-400" />
                <span className="absolute left-6 top-6 rounded-full bg-navy-950/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-lime-400 backdrop-blur">
                  {getService(p.service)?.name}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="flex items-center gap-1.5 text-xs text-white/60">
                    <MapPin className="size-3.5 text-lime-400" /> {p.place} · {p.category}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">{p.title}</h3>
                  <p className="mt-2 max-w-lg text-sm text-white/65">{p.summary}</p>
                  <div className="mt-4 flex gap-6 border-t border-white/15 pt-4">
                    {p.metrics.map((m) => (
                      <div key={m.k}>
                        <p className="text-lg font-bold text-white">{m.v}</p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">{m.k}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
