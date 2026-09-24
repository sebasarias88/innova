import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceList } from "@/components/services/ServiceList";
import { CtaBand } from "@/components/layout/CtaBand";

export const metadata: Metadata = {
  title: "Servicios",
  description: "CCTV, energía solar, automatización de puertas, domótica, cableado estructurado, UPS y servicios informáticos en Armenia y todo Colombia.",
};

export default function ServiciosPage() {
  return (
    <>
      <PageHero
        eyebrow="Portafolio de servicios"
        image="/img/tecnico-cables.jpg"
        title={
          <>
            7 soluciones. <span className="text-lime-400">Un solo aliado.</span>
          </>
        }
        text="Ofrecemos soluciones de alta tecnología adaptadas a las necesidades de hogares, empresas e industrias: instalación, mantenimiento, reparación y suministro de productos de calidad."
      />
      <section className="pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ServiceList />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
