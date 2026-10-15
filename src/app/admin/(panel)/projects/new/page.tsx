import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { services } from "@/lib/services";
import { PageHeader } from "@/components/admin/ui";
import { ProjectForm } from "../ProjectForm";
import { saveProject } from "../actions";

export const metadata: Metadata = { title: "Nuevo proyecto" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Nuevo proyecto" description="Después de crearlo podrás subir las fotos." back={{ href: "/admin/projects", label: "Proyectos" }} />
      <ProjectForm action={saveProject.bind(null, null)} services={services.map(({ slug, name }) => ({ slug, name }))} />
    </div>
  );
}
