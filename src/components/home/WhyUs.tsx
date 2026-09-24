import Image from "next/image";
import { whyUs } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

export function WhyUs() {
  return (
    <section className="relative overflow-hidden bg-ice-50 py-24 text-navy-900 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <Eyebrow dark>¿Por qué elegirnos?</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-tight sm:text-6xl">
            Confianza, eficiencia y <span className="text-royal-500">sostenibilidad.</span>
          </h2>
          <p className="mt-6 max-w-lg text-pretty text-lg text-navy-900/65">
            Combinamos tecnología de vanguardia con un equipo altamente capacitado. Ese es nuestro compromiso con cada cliente.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {whyUs.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.08}>
                <div className="group h-full rounded-3xl border border-navy-900/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-royal-500/40 hover:shadow-[0_30px_60px_-30px_rgba(6,96,216,0.4)]">
                  <span className="grid size-12 place-items-center rounded-2xl bg-royal-500 text-white transition-colors group-hover:bg-lime-400 group-hover:text-navy-900">
                    <Icon name={w.icon} className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold tracking-tight">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-900/60">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Imagen en franjas, tal como el brochure */}
        <div className="relative hidden h-[640px] lg:block">
          <Reveal y={40} className="absolute inset-0">
            <Image src="/img/tecnico-lima.jpg" alt="Técnico INNOVA certificado" fill sizes="50vw" className="object-contain object-right" />
          </Reveal>
          <div className="absolute -bottom-4 right-0 rounded-2xl bg-navy-900 p-5 text-white shadow-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime-400">Garantía</p>
            <p className="mt-1 text-2xl font-bold">Respaldo total</p>
            <p className="text-xs text-white/60">en productos e instalación</p>
          </div>
        </div>
      </div>
    </section>
  );
}
