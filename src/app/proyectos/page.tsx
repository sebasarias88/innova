import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ProjectsGrid } from "@/components/tools/ProjectsGrid";
import { CtaBand } from "@/components/layout/CtaBand";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Proyectos de videovigilancia, energía solar, automatización, redes y respaldo energético realizados por INNOVA.",
};

export default function ProyectosPage() {
  return (
    <>
      <PageHero
        eyebrow="Portafolio"
        image="/img/tecnico-campo.webp"
        title={
          <>
            Proyectos que <span className="text-lime-400">hablan por nosotros.</span>
          </>
        }
        text="Hogares, comercios, conjuntos e industrias que ya confían su seguridad y su energía a INNOVA."
      />
      <section className="pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ProjectsGrid />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
