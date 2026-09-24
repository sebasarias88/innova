import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getService, services } from "@/lib/services";
import { waLink } from "@/lib/site";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { HudCorners } from "@/components/ui/HudCorners";
import { Reveal } from "@/components/ui/Reveal";
import { Faq } from "@/components/ui/Faq";
import { Marquee } from "@/components/ui/Marquee";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CtaBand } from "@/components/layout/CtaBand";
import { Process } from "@/components/home/Process";
import { SolarTeaser } from "@/components/home/SolarTeaser";
import { NightVision } from "@/components/services/NightVision";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: `${s.name} en Armenia y el Eje Cafetero`,
    description: `${s.short} ${s.description}`.slice(0, 160),
    openGraph: { images: [s.image] },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const idx = services.findIndex((x) => x.slug === s.slug);
  const lname = s.name.toLowerCase().replace("cctv", "CCTV").replace("ups", "UPS");
  const related = [1, 2, 3].map((o) => services[(idx + o) % services.length]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
        <div className="absolute -right-40 top-0 size-[700px] rounded-full bg-royal-500/25 blur-[150px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
              <Link href="/" className="hover:text-white">Inicio</Link> /
              <Link href="/servicios" className="hover:text-white">Servicios</Link> /
              <span className="text-lime-400">{s.name}</span>
            </nav>
            <Eyebrow>{s.kicker}</Eyebrow>
            <h1 className="mt-6 text-balance font-bold tracking-tight text-white">
              <span className="block text-6xl leading-[0.9] sm:text-8xl">{s.title[0]}</span>
              <span className="mt-3 block text-2xl font-semibold text-royal-300 sm:text-4xl">{s.title[1]}</span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-white/70">{s.description}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href={waLink(s.wa)} external icon={<WhatsAppIcon className="size-3.5" />}>
                Cotizar por WhatsApp
              </Button>
              <Button href="/arma-tu-sistema" variant="ghost" icon={<ArrowRight className="size-3.5" />}>
                Arma tu sistema
              </Button>
            </div>
          </div>

          <Reveal className="relative">
            <div className="relative aspect-[4/4.4] overflow-hidden rounded-[2rem] border border-white/10">
              <Image src={s.image} alt={s.name} fill priority sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-navy-950/20" />
              <div className="scanlines absolute inset-0 opacity-40" />
              <HudCorners className="m-5 text-lime-400" size={26} />
              <div className="absolute left-7 top-7 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white">
                <span className="size-2 animate-blink rounded-full bg-red-500" /> Live · {s.slug.toUpperCase().slice(0, 12)}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-4 max-w-[260px] rounded-2xl border border-white/10 bg-navy-900/90 p-5 shadow-2xl backdrop-blur-xl sm:-left-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime-400">Incluye</p>
              <p className="mt-2 text-sm font-semibold leading-snug text-white">{s.includes[0]}</p>
              <p className="mt-1 text-xs text-white/50">+ {s.includes.length - 1} servicios más</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Usos */}
      <div className="border-y border-white/10 bg-navy-900 py-5 text-lg font-semibold text-white/70">
        <Marquee items={s.useCases} />
      </div>

      {/* Incluye */}
      <section className="bg-ice-50 py-24 text-navy-900 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Eyebrow dark>¿Qué incluye?</Eyebrow>
            <h2 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-tight sm:text-5xl">
              Todo lo que necesitas, <span className="text-royal-500">llave en mano.</span>
            </h2>
          </div>
          <ol className="border-t border-navy-900/10">
            {s.includes.map((inc, i) => (
              <Reveal key={inc} delay={i * 0.06}>
                <li className="group flex items-center gap-6 border-b border-navy-900/10 py-6 sm:py-8">
                  <span className="font-mono text-sm text-royal-500">0{i + 1}</span>
                  <span className="text-xl font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-3xl">{inc}</span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Beneficios */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Eyebrow>Beneficios</Eyebrow>
          <h2 className="mt-5 max-w-3xl text-balance text-4xl font-bold leading-[1] tracking-tight text-white sm:text-6xl">
            Tecnología que trabaja <span className="text-lime-400">por ti.</span>
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {s.highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.08}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-lime-400/40">
                  <div className="absolute -right-10 -top-10 size-32 rounded-full bg-royal-500/20 blur-2xl transition-colors group-hover:bg-lime-400/20" />
                  <span className="relative grid size-12 place-items-center rounded-2xl bg-royal-500 text-white transition-colors group-hover:bg-lime-400 group-hover:text-navy-900">
                    <Icon name={h.icon} className="size-6" />
                  </span>
                  <h3 className="relative mt-8 text-xl font-bold tracking-tight text-white">{h.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-white/60">{h.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {s.slug === "cctv" && (
            <div className="mt-20 grid items-center gap-10 lg:grid-cols-[1fr_1.6fr]">
              <div>
                <Eyebrow>Visión nocturna</Eyebrow>
                <h3 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Protección las 24 horas, incluso en total oscuridad.</h3>
                <p className="mt-4 text-white/60">Arrastra el control para comparar la imagen diurna con la visión infrarroja de nuestras cámaras.</p>
              </div>
              <NightVision src="/img/puertas-instalacion.jpg" />
            </div>
          )}
        </div>
      </section>

      {s.slug === "energia-solar" && <SolarTeaser />}

      <Process />

      {/* FAQ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <Eyebrow>Preguntas frecuentes</Eyebrow>
            <h2 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-tight text-white sm:text-5xl">Sobre {lname}</h2>
          </div>
          <Faq items={s.faqs} dark />
        </div>
      </section>

      {/* Relacionados */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Complementa tu proyecto</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/servicios/${r.slug}`} className="group relative h-64 overflow-hidden rounded-3xl border border-white/10">
                <Image src={r.image} alt={r.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover opacity-50 transition duration-700 group-hover:scale-105 group-hover:opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <div>
                    <Icon name={r.icon} className="size-6 text-lime-400" />
                    <p className="mt-3 text-xl font-bold text-white">{r.name}</p>
                  </div>
                  <ArrowUpRight className="size-5 text-white transition-transform group-hover:rotate-45" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={`¿Hablamos de tu proyecto de ${lname}?`} wa={s.wa} />
    </>
  );
}
