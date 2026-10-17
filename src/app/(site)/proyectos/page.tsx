import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ProjectsGrid } from "@/components/tools/ProjectsGrid";
import { CtaBand } from "@/components/layout/CtaBand";
import { getPublicProjects } from "@/lib/public-projects";

// Refreshed every 5 minutes and right after changes in the admin panel.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Proyectos realizados en Armenia y el Eje Cafetero",
  alternates: { canonical: "/proyectos" },
  description: "Proyectos de videovigilancia, energía solar, automatización, redes y respaldo energético realizados por INNOVA.",
};

export default async function ProyectosPage() {
  const { projects } = await getPublicProjects();
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
          <ProjectsGrid projects={projects} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
