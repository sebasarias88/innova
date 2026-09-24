import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cities, getCity } from "@/lib/cities";
import { services } from "@/lib/services";
import { waLink } from "@/lib/site";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Coverage } from "@/components/home/Coverage";
import { Process } from "@/components/home/Process";
import { CtaBand } from "@/components/layout/CtaBand";

type Props = { params: Promise<{ ciudad: string }> };

export function generateStaticParams() {
  return cities.map((c) => ({ ciudad: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad } = await params;
  const c = getCity(ciudad);
  if (!c) return {};
  return {
    title: `Cámaras de seguridad y energía solar en ${c.name}, ${c.dept}`,
    description: `Instalación de cámaras de seguridad (CCTV), paneles solares, automatización de puertas, domótica, redes y UPS en ${c.name}, ${c.dept}. Asesoría gratis.`,
  };
}

export default async function CityPage({ params }: Props) {
  const { ciudad } = await params;
  const c = getCity(ciudad);
  if (!c) notFound();
  const wa = `Hola INNOVA 👋 Estoy en ${c.name} y quiero una asesoría.`;

  return (
    <>
      <PageHero
        eyebrow={`${c.name} · ${c.dept}`}
        image="/img/cctv-poste.webp"
        title={
          <>
            Cámaras de seguridad y energía solar en <span className="text-lime-400">{c.name}.</span>
          </>
        }
        text={`${c.blurb} Instalamos CCTV, paneles solares, puertas automáticas, domótica, redes y UPS para hogares, empresas e industrias de ${c.name}.`}
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href={waLink(wa)} external icon={<WhatsAppIcon className="size-3.5" />}>
            Asesoría en {c.name}
          </Button>
          <Button href="/arma-tu-sistema" variant="ghost" icon={<ArrowRight className="size-3.5" />}>
            Arma tu sistema
          </Button>
        </div>
      </PageHero>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Servicios disponibles en {c.name}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <Link key={s.slug} href={`/servicios/${s.slug}`} className="group flex h-full flex-col justify-between gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-lime-400/50">
                <div className="flex items-start justify-between">
                  <Icon name={s.icon} className="size-8 text-royal-300 transition-colors group-hover:text-lime-400" />
                  <ArrowUpRight className="size-4 text-white/40 transition group-hover:rotate-45 group-hover:text-lime-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{s.name}</p>
                  <p className="mt-1 text-sm text-white/55">{s.short}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Process />
      <Coverage />
      <CtaBand title={`Protege tu espacio en ${c.name}.`} wa={wa} />
    </>
  );
}
