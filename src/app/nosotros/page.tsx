import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/brand/Logo";
import { Stats } from "@/components/home/Stats";
import { WhyUs } from "@/components/home/WhyUs";
import { Coverage } from "@/components/home/Coverage";
import { CtaBand } from "@/components/layout/CtaBand";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "INNOVA Seguridad y Sistemas: expertos en soluciones integrales de seguridad electrónica, energía solar, automatización y redes en Armenia, Quindío.",
};

const values = [
  { icon: "ShieldCheck", title: "Confianza", text: "Cumplimos lo que prometemos. Cada instalación lleva nuestro nombre y nuestra garantía." },
  { icon: "Gauge", title: "Eficiencia", text: "Soluciones bien dimensionadas: ni de más ni de menos. Tu inversión rinde al máximo." },
  { icon: "Leaf", title: "Sostenibilidad", text: "Impulsamos la energía limpia y la tecnología que dura, para un futuro más responsable." },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        eyebrow="Quiénes somos"
        image="/img/tecnico-torre.jpg"
        title={
          <>
            Tecnología que protege, <span className="text-lime-400">conecta y transforma.</span>
          </>
        }
      />

      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className="text-balance text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
              En <span className="text-lime-400">INNOVA Seguridad y Sistemas</span> somos expertos en soluciones integrales de seguridad electrónica, energía solar, automatización y redes.
            </p>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-white/65">
              Combinamos tecnología de vanguardia con un equipo altamente capacitado, brindando instalación, mantenimiento, reparación y suministro de productos de calidad. Desde Armenia, Quindío, acompañamos a hogares, empresas e industrias en todo el país.
            </p>
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime-400">Nuestro compromiso</p>
              <p className="mt-3 text-xl font-semibold text-white">Brindar confianza, eficiencia y sostenibilidad a cada uno de nuestros clientes.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Image src="/img/tecnico-campo.jpg" alt="Técnico INNOVA en campo" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 grid size-36 place-items-center rounded-3xl bg-lime-400 p-6 text-navy-900 shadow-2xl">
              <Logo variant="mark" className="h-full w-auto" />
            </div>
          </Reveal>
        </div>
      </section>

      <Stats />

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Eyebrow>Nuestros valores</Eyebrow>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <div className="group h-full rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 transition-colors hover:border-lime-400/40">
                  <span className="font-mono text-sm text-white/30">0{i + 1}</span>
                  <Icon name={v.icon} className="mt-8 size-10 text-lime-400" />
                  <h3 className="mt-6 text-3xl font-bold tracking-tight text-white">{v.title}</h3>
                  <p className="mt-3 text-white/60">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WhyUs />
      <Coverage />
      <CtaBand />
    </>
  );
}
