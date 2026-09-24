"use client";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, MapPin } from "lucide-react";
import { projects } from "@/lib/projects";
import { getService } from "@/lib/services";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HudCorners } from "@/components/ui/HudCorners";

gsap.registerPlugin(ScrollTrigger);

export function ProjectsRail() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const el = track.current!;
      const dist = () => el.scrollWidth - window.innerWidth + 48;
      const tween = gsap.to(el, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      return () => tween.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden bg-navy-950 py-24 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Proyectos</Eyebrow>
            <h2 className="mt-5 max-w-2xl text-balance text-4xl font-bold leading-[1] tracking-tight text-white sm:text-6xl">
              Resultados que se ven <span className="text-royal-300">en cada instalación.</span>
            </h2>
          </div>
          <Link href="/proyectos" className="group inline-flex items-center gap-2 font-semibold text-white hover:text-lime-400">
            Ver todos los proyectos <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </Link>
        </div>
      </div>

      <div
        ref={track}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:snap-none lg:overflow-visible lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
      >
        {projects.map((p, i) => {
          const s = getService(p.service)!;
          return (
            <Link
              key={p.slug}
              href="/proyectos"
              className="group relative h-[440px] w-[82vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] sm:w-[440px] lg:h-[62vh] lg:w-[36vw] lg:max-w-[560px]"
            >
              <Image src={p.image} alt={p.title} fill sizes="(max-width:1024px) 82vw, 36vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
              <HudCorners className="m-4 text-white/40 transition-colors group-hover:text-lime-400" />
              <div className="absolute left-6 top-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white">
                <span className="size-1.5 animate-blink rounded-full bg-red-500" />
                P-{String(i + 1).padStart(2, "0")} · {p.category}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="flex items-center gap-1.5 text-xs text-white/60">
                  <MapPin className="size-3.5 text-lime-400" /> {p.place}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{p.title}</h3>
                <p className="mt-1 text-sm text-royal-300">{s.name}</p>
                <div className="mt-5 flex gap-6 border-t border-white/15 pt-4">
                  {p.metrics.map((m) => (
                    <div key={m.k}>
                      <p className="text-xl font-bold text-white">{m.v}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">{m.k}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
        <Link
          href="/contacto"
          className="group relative flex h-[440px] w-[82vw] shrink-0 snap-start flex-col justify-between rounded-[1.75rem] bg-lime-400 p-8 text-navy-900 sm:w-[380px] lg:h-[62vh] lg:w-[28vw]"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Tu proyecto</span>
          <div>
            <p className="text-4xl font-bold leading-[1] tracking-tight">¿El próximo proyecto es el tuyo?</p>
            <span className="mt-6 inline-grid size-14 place-items-center rounded-full bg-navy-900 text-lime-400 transition-transform group-hover:rotate-45">
              <ArrowUpRight className="size-6" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
